var express = require('express');
var axios = require('axios')
var jwt = require('jsonwebtoken');
var login = require('connect-ensure-login')
var https = require('https')
var router = express.Router();
var User = require('../controllers/user')

//Axios instance (so that it doesn't reject self-signed certificates)
//Can remove later when a non-self-signed cert is used
const instance = axios.create({
	httpsAgent: new https.Agent({
		rejectUnauthorized: false
	})
})

//Setup github
var request = require('request')
var url = require('url')
var configGithub = require('../lib/configGithub.js')
var GithubConfig = {
  'client_id'    : configGithub['client_id'],
  'secret'       : configGithub['secret'],
  'redirect_uri' : '',
  'scope'        : '',
  'state'        : Math.round(Math.random() * 10)
}

//Setup Twitter
var Twitter = require("node-twitter-api")
var configTwitter = require('../lib/configTwitter.js')
var twitter = new Twitter({
    consumerKey: configTwitter['consumerKey'],
    consumerSecret: configTwitter['consumerSecret'],
    callback: configTwitter['callback']
})
var requestSecret

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('auth', { title: 'Área Autenticada' });
});

/**
 * Método Post para adicionar uma conta Google.
 * Login é verificado pelo middleware connect-ensure-login.
 */
router.post('/addGoogle', 
	login.ensureLoggedIn(),
	function(req, res, next){
		var token = req.body.token
		var email = req.body.email
		axios({
			method: 'get',
			url: 'https://oauth2.googleapis.com/tokeninfo?id_token=' + token
		})
		.then(response => {
			instance({
			//axios({
				method: 'post',
				url: 'https://localhost:3000/api/auth/addGoogle',
				headers: {'Authorization': req.session.token},
				data: {
					email: email
				}
			})
			.then(data => {
				if(data.data != ""){
					req.session.passport.user = data.data
				}
				res.done()
			})
			.catch(erro => {
				res.render('error', {error: erro, message: 'erro no add idGoogle: ' + erro})
			})
		})
	}
)

/**
 * Método Post para adicionar uma conta Facebook.
 * Login é verificado pelo middleware connect-ensure-login.
 */
router.post('/addFacebook',
	login.ensureLoggedIn(),
	function(req, res, next){
		var id = req.body.id
		instance({
		//axios({
			method: 'post',
			url: 'https://localhost:3000/api/auth/addFacebook',
			headers: {'Authorization': req.session.token},
			data: {
				idFacebook: id
			}
		})
			.then(data => {
				if(data.data != ""){
					req.session.passport.user = data.data
				}
				res.done()
			})
			.catch(erro => {
				res.render('error', {error: erro, message: 'erro no add idFacebook: ' + erro})
			})
	}
)

/**
 * Método Post para fazer login através de uma 
 * conta Google. 
 */
router.post('/loginGoogle', function(req, res, next){
	var token = req.body.token
	var email = req.body.email
	axios({
		method: 'get',
		url: 'https://oauth2.googleapis.com/tokeninfo?id_token=' + token
	})
	.then(response => {
		User.checkGoogle(email)
			.then(result => {
				var user = result[0]
				if(user){
					try{
						req.login(user, {session: true}, async(error) => {
							if(error){
								return next(error)
							}
							var myuser = {_id: user._id, username: user.username}
							var token = jwt.sign({user: myuser}, 'lei')
							req.session.token = token
							var redirect
							if(req.session.returnTo){
								redirect = req.session.returnTo
								req.session.returnTo = undefined
							}
							else{
								redirect = '/user'
							}
							res.jsonp(redirect)
						})	
					} catch(error){
						res.redirect('/login')
					}
				}
			})
	})
	.catch(error => console.log(error))
})

/**
 * Método Post para fazer login através de uma 
 * conta Facebook. 
 */
router.post('/loginFacebook', function(req, res, next){
	axios({
		method: 'get',
		url: 'https://graph.facebook.com/me?fields=name&access_token='+req.body.token,
		headers: {'Headers': 'Content-type:application/json'}
	})
	.then(response => {
		var id = response.data.id
		User.checkFacebook(id)
		.then(result => {
			var user = result[0]
			if(user){
				try{
					req.login(user, {session: true}, async(error) => {
						if(error){
							return next(error)
						}
						var myuser = {_id: user._id, username: user.username}
						var token = jwt.sign({user: myuser}, 'lei')
						req.session.token = token
						var redirect
						if(req.session.returnTo){
							redirect = req.session.returnTo
							req.session.returnTo = undefined
						}
						else{
							redirect = '/'
						}
						res.jsonp(redirect)
					})	
				} catch(error){
					res.redirect('/login')
				}
			}
		})
	})
	.catch(error => console.log(error))
})

/**
 * Método Get inicial para o processo de login
 * ou associação de contas GitHub.
 */
router.get('/loginGithub', function(req, res){
    var url = 'https://github.com/login/oauth/authorize'
        + '?client_id=' + GithubConfig.client_id
        + (GithubConfig.scope ? '&scope=' + GithubConfig.scope : '')
        + '&state=' + GithubConfig.state;
    
    res.setHeader('location', url)
    res.statusCode = 302;
    res.end();
})

/**
 * Função chamada como callback após autorização
 * GitHub. Recebe um código de autorização e usa-o
 * para receber um token de acesso, através de uma
 * chamada à API do GitHub. 
 */
router.get('/callbackGithub', function(req, res, next){
    var query = url.parse(req.url, true).query
    if(query.state == GithubConfig.state){
        payload = {
            'code'          : query.code,
            'client_id'     : GithubConfig.client_id,
            'client_secret' : GithubConfig.secret
		}
        request.post({
            url: 'https://github.com/login/oauth/access_token',
            formData: payload,
            headers: {'Accept': 'application/json'}
        }, function(error, response, body){
            if(!error && response.statusCode == 200){
                var token = JSON.parse(body).access_token
                res.statusCode = 302
                authorized(req, res, token, next)
			}
			if(error){
				console.log(error)
			}
        })
    }
})

/**
 * Função chamada após ser recebido um token de 
 * acesso pelo GitHub. Faz um pedido à API do 
 * GitHub com o token de acesso para obter a informação
 * do utilizador. Se o login já tiver feito, vai fazer 
 * associação da conta GitHub à conta local, senão vai
 * fazer login.
 */
var authorized = function(req, res, token, next){
    request.get(
        {
            url: 'https://api.github.com/user',
            headers: {'Authorization': 'token '+token, 'User-Agent': req.get('User-Agent')}
        },
        function(error, response, body){
            if(!error && response.statusCode == 200){
                body = JSON.parse(body)
                var id = body.id
				if(req.session.token){
					jwt.verify(req.session.token, 'lei', function(errVerify, decoded){
						if(!errVerify){
							instance({
							//axios({
								method: 'post',
								url: 'https://localhost:3000/api/auth/addGithub',
								headers: {'Authorization': req.session.token},
								data: {
									idGithub: id
								}
							})
							.then(data => {
								if(data.data != ""){
									req.session.passport.user = data.data
								}
								res.redirect('/user')
							})
							.catch(erro => {
								res.render('error', {error: erro, message: 'erro no add idGithub: ' + erro})
							})
						}
						else{
							res.redirect('/')
						}
					})
				}
				else{
					User.checkGithub(id)
					.then(result => {
						var user = result[0]
						if(user){
							try{
								req.login(user, {session: true}, async(error) => {
									if(error){
										return next(error)
									}
									var myuser = {_id: user._id, username: user.username}
									var token = jwt.sign({user: myuser}, 'lei')
									req.session.token = token
									if(req.session.returnTo){
										var redirect = req.session.returnTo
										req.session.returnTo = undefined
										res.redirect(redirect)   
									}
									else{
										res.redirect('/')
									}
								})	
							} catch(error){
								res.redirect('/login')
							}
						}
					})
				}
            }
        else {
            res.end(body)
        }
	})
}

/**
 * Método Get para fazer login através do Twitter.
 * Faz um pedido à API do Twitter para obter um token de pedido.
 */
router.get('/loginTwitter', function(req, res){
    twitter.getRequestToken(function(err, requestToken, reqSecret){
        if(err){
            res.status(500).send(err)
        }
        else{
            requestSecret = reqSecret
            res.redirect('https://api.twitter.com/oauth/authenticate?oauth_token=' + requestToken)
        }
    }) 
})

/**
 * Callback de Twitter. Recebe o token de pedido e tenta 
 * trocá-lo por um token de acesso. Com o token de acesso,
 * vai buscar os dados do utilizador. Se o utilizador
 * estiver autenticado faz associação de conta, senão
 * faz login para a sua conta local.
 */
router.get('/callbackTwitter', function(req, res){
    var requestToken = req.query.oauth_token
    var verifier = req.query.oauth_verifier
    twitter.getAccessToken(requestToken, requestSecret, verifier,
        function(err, accessToken, accessSecret){
            if(err){
                res.status(500).send(err)
            }
            else{
                twitter.verifyCredentials(accessToken, accessSecret,
                    function(err2, user){
                        if(err2){
                            res.status(500).send(err2)
                        }
						else if(req.session.token){
							jwt.verify(req.session.token, 'lei', function(errVerify, decoded){
								if(!errVerify){
									var id = user.id
									console.log('pre addGithub')
									instance({
									//axios({
										method: 'post',
										url: 'https://localhost:3000/api/auth/addTwitter',
										headers: {'Authorization': req.session.token},
										data: {
											idTwitter: id
										}
									})
									.then(data => {
										if(data.data != ""){
											req.session.passport.user = data.data
										}
										res.redirect('/user')
									})
									.catch(erro => {
										res.render('error', {error: erro, message: 'erro no add idGithub: ' + erro})
									})
								}
								else{
									res.redirect('/')
								}
							})
						}
                        else{
							var id = user.id
							User.checkTwitter(id)
							.then(result => {
								var user = result[0]
								if(user){
									try{
										req.login(user, {session: true}, async(error) => {
											if(error){
												return next(error)
											}
											var myuser = {_id: user._id, username: user.username}
											var token = jwt.sign({user: myuser}, 'lei')
											req.session.token = token
											if(req.session.returnTo){
												var redirect = req.session.returnTo
												req.session.returnTo = undefined
												res.redirect(redirect)   
											}
											else{
												res.redirect('/')
											}
										})	
									} catch(error){
										res.redirect('/login')
									}
								}
							})
                        }
                    })
            }
        }
    )
})

module.exports = router;