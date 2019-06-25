var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var axios = require('axios')
const https = require('https')
const login = require('connect-ensure-login')

//Axios instance (so that it doesn't reject self-signed certificates)
//Can remove later when a non-self-signed cert is used
const instance = axios.create({
	httpsAgent: new https.Agent({
		rejectUnauthorized: false
	})
})

/* GET user information. */
router.get('/',
	login.ensureLoggedIn(),
	function(req, res, next){
		res.render('user', {user: req.session.passport.user})
	}
)

/**
 * Get de página que mostra lista de aplicações.
 */
router.get('/apps',
	login.ensureLoggedIn(),
	function(req, res, next){
		//axios({
		instance({
			method: 'get',
			url: 'https://localhost:3000/api/user/getClients',
			headers: {'Authorization': req.session.token}
		})
		.then(clients => {
			res.render('apps', {clients: clients.data})
		})
	}
)

/**
 * Get de página de registo de novo cliente.
 */
router.get('/registerapp',
	login.ensureLoggedIn(),
	function(req, res, next){
		res.render('signup-client')
	}
)

/**
 * Post para adicionar novos clientes.
 */
router.post('/registerapp', 
	login.ensureLoggedIn(),
	function(req, res, next){
		//axios({
		instance({
			method: 'post',
			url: 'https://localhost:3000/api/user/registerClient',
			headers: {'Authorization': req.session.token},
			data: {
				name: req.body.name
			}
		})
		.then(clients => {
			res.redirect('/user/apps')
		})
	}
)

module.exports = router;
