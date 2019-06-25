var express = require('express');
var jwt = require('jsonwebtoken');
var router = express.Router();
const uuid = require('uuid/v4')
const passport = require('passport')
const Client = require('../../controllers/client')
const AccessTokens = require('../../controllers/accessToken')
const User = require('../../controllers/user')

/**
 * Get de informação do utilizador. É usado por 
 * clientes e é preciso um token de acesso 
 * válido para ter acesso à informação.
 */
router.get('/', 
    passport.authenticate('bearer', {session: false}),
    function(req, res){
        var split = req.headers.authorization.split(' ')
        AccessTokens.checkToken(split[1])
            .then(dados => {
                User.getUser(dados.userID)
                    .then(dadosUser => res.jsonp({email: dadosUser.username, name: dadosUser.name, number: dadosUser.number}))
            })
            .catch(erro => res.status(500).send('Erro no get de user: ' + erro))
    }
)

/**
 * Get de lista de Clientes para o utilizador ativo.
 * Está protegido por JSON Web Token.
 */
router.get('/getClients', function(req, res){
    var token = req.headers.authorization
    if(token){
        jwt.verify(token, 'lei', function(err, decoded){
            if(!err){
                var username = decoded.user.username
                Client.findClientByUser(username)
                .then(dados => res.jsonp(dados))
                .catch(erro => res.status(500).send('Erro no get de clientes ' + erro))
            }
            else{
                res.redirect('/')
            }
        })
    }
    else{
        res.redirect('/')
    }
})

/**
 * Post para adicionar um Cliente novo.
 * Está protegido por JSON Web Token.
 */
router.post('/registerClient', function(req, res){
    var token = req.headers.authorization
    if(token){
        jwt.verify(token, 'lei', function(err, decoded){
            if(!err){
		        const newID = uuid()
		        const newSecret = uuid()
                Client.insert(req.body.name, newID, newSecret, decoded.user.username)
                .then(dados => res.jsonp(dados))
                .catch(erro => res.status(500).send('Erro no get de clientes ' + erro))
            }
            else{
                res.redirect('/')
            }
        })
    }
    else{
        res.redirect('/')
    }
})

module.exports = router;