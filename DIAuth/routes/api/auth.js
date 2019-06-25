var express = require('express');
var jwt = require('jsonwebtoken');
var User = require('../../controllers/user')
var router = express.Router();

/**
 * Endpoint da API usado para adicionar contas da Google
 * a um utilizador. 
 * Não adiciona a conta caso já tenha sido usada 
 * por outro utilizador. 
 * O acesso é protegido por JSON Web Token.
 */
router.post('/addGoogle', function(req, res) {
    var token = req.headers.authorization
    if(token){
        jwt.verify(token, 'lei', function(err, decoded) {
            if(!err){
                var email = req.body.email
                var username = decoded.user.username
                User.checkGoogle(email)
                    .then(dados => {
                        if(dados.length == 0){
                            User.addGoogle(username, email)
                                .then(dados2 => res.jsonp(dados2))
                                .catch(erro => res.status(500).send('Erro na edição: ' + erro));
                        }
                        else{
                            res.end()
                        }
                    })
            }
            else{
                res.redirect('/');
            }
        });
    } 
    else{
        res.redirect('/');
    }
});

/**
 * Adiciona conta de Facebook a uma conta existente.
 * Não adiciona a conta caso já tenha sido usada 
 * por outro utilizador. 
 * Acesso é protegido por JSON Web Token.
 */
router.post('/addFacebook', function(req, res) {
    var token = req.headers.authorization
    if(token){
        jwt.verify(token, 'lei', function(err, decoded) {
            if(!err){
                var idFacebook = req.body.idFacebook
                var username = decoded.user.username
                User.checkFacebook(idFacebook)
                    .then(dados => {
                        if(dados.length == 0){
                            User.addFacebook(username, idFacebook)
                                .then(dados2 => res.jsonp(dados2))
                                .catch(erro => res.status(500).send('Erro na edição: ' + erro));
                        }
                        else{
                            res.end()
                        }
                    })
            }
            else{
                res.redirect('/');
            }
        });
    } 
    else{
        res.redirect('/');
    }
});

/**
 * Adiciona conta de GitHub a uma conta existente.
 * Não adiciona a conta caso já tenha sido usada 
 * por outro utilizador. 
 * Acesso protegido por JSON Web Token.
 */
router.post('/addGithub', function(req, res) {
    var token = req.headers.authorization
    if(token){
        jwt.verify(token, 'lei', function(err, decoded) {
            if(!err){
                var idGithub = req.body.idGithub
                var username = decoded.user.username
                User.checkGithub(idGithub)
                    .then(dados => {
                        if(dados.length == 0){
                            User.addGithub(username, idGithub)
                                .then(dados2 => res.jsonp(dados2))
                                .catch(erro => res.status(500).send('Erro na edição: ' + erro));
                        }
                        else{
                            res.end()
                        }
                    })
            }
            else{
                res.redirect('/');
            }
        });
    } 
    else{
        res.redirect('/');
    }
});

/**
 * Adiciona login de Twitter a uma conta.
 * Não adiciona a conta caso já tenha sido usada 
 * por outro utilizador. 
 * Acesso protegido por JSON Web Token.
 */
router.post('/addTwitter', function(req, res) {
    var token = req.headers.authorization
    if(token){
        jwt.verify(token, 'lei', function(err, decoded) {
            if(!err){
                var idTwitter = req.body.idTwitter
                var username = decoded.user.username
                User.checkTwitter(idTwitter)
                    .then(dados => {
                        if(dados.length == 0){
                            User.addTwitter(username, idTwitter)
                                .then(dados2 => res.jsonp(dados2))
                                .catch(erro => res.status(500).send('Erro na edição: ' + erro));
                        }
                        else{
                            res.end()
                        }
                    })
            }
            else{
                res.redirect('/');
            }
        });
    } 
    else{
        res.redirect('/');
    }
});

/**
 * Usado para verificar se uma certa conta Google 
 * existe na base de dados, para ver se utilizador 
 * pode ser autenticado.
 */
router.post('/loginGoogle', function(req, res){
    User.checkGoogle(req.body.login)
        .then(dados => res.jsonp(dados))
        .catch(erro => res.status(500).send('Erro a buscar conta: ' + erro))
})

/**
 * Usado para verificar se uma certa conta Facebook
 * existe na base de dados, para ver se utilizador 
 * pode ser autenticado.
 */
router.post('/loginFacebook', function(req, res){
    User.checkFacebook(req.body.login)
        .then(dados => res.jsonp(dados))
        .catch(erro => res.status(500).send('Erro a buscar conta: ' + erro))
})

/**
 * Usado para verificar se uma certa conta GitHub
 * existe na base de dados, para ver se utilizador 
 * pode ser autenticado.
 */
router.post('/loginGithub', function(req, res){
    User.checkGithub(req.body.login)
        .then(dados => res.jsonp(dados))
        .catch(erro => res.status(500).send('Erro a buscar conta: ' + erro))
})

/**
 * Usado para verificar se uma certa conta Twitter 
 * existe na base de dados, para ver se utilizador 
 * pode ser autenticado.
 */
router.post('/loginTwitter', function(req, res){
    User.checkTwitter(req.body.login)
        .then(dados => res.jsonp(dados))
        .catch(erro => res.status(500).send('Erro a buscar conta: ' + erro))
})

module.exports = router;