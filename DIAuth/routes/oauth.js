const express = require('express');
const router = express.Router();
const oauth2orize = require('oauth2orize')
const login = require('connect-ensure-login')
const passport = require('passport')
const Client = require('../controllers/client')
const Code = require('../controllers/code')
const Token = require('../controllers/accessToken')

const options = require('../utils/options')
const utils = require('../utils/utils')
const validate = require('../utils/validate')

// Create OAuth2 server
const server = oauth2orize.createServer()

// Configure expiresIn
const expiresIn = {expires_in: options.token.expiresIn}

// Grant implicit authorization
server.grant(oauth2orize.grant.token((client, user, ares, done) => {
    console.log(client)
    console.log(user)
    if(client.scope == undefined){
        client.scope = '*'
    }
    const token = utils.createToken({sub: user.username, exp: options.codeToken.expiresIn})
    const expiration = options.token.calculateExpirationDate()
    Token.insert(token, expiration, user.username, client.id, client.scope)
    .then(() => done(null, token, expiresIn))
    .catch(err => done(err))
}))

// Grant authorization codes
server.grant(oauth2orize.grant.code((client, redirectURI, user, ares, done) => {
    const code = utils.createToken({sub: user.username, exp: options.codeToken.expiresIn})
    Code.save(code, client.clientId, redirectURI, user.username, client.scope)
    .then(() => done(null, code))
    .catch(err => done(err))
}))

// Exchange authorization codes for access tokens
server.exchange(oauth2orize.exchange.code((client, code, redirectURI, done) => {
    Code.delete(code)
    .then(authCode => validate.authCode(code, authCode, client, redirectURI))
    .then(authCode => validate.generateTokens(authCode))
    .then((tokens) => {
        if(tokens.length === 1){
            return done(null, tokens[0], null, expiresIn)
        }    
        if(tokens.length === 2){
            return done(null, tokens[0], tokens[1], expiresIn)
        }
        throw new Error('Error exchanging auth code for tokens')
    })
}))

// User authorization endpoint
router.get('/dialog/authorize',
    login.ensureLoggedIn(),
    server.authorization((clientID, redirectURI, scope, done) => {
        Client.findClientById(clientID)
        .then((client) => {
            if(client){
                client.scope = scope
            }
            // WARNING: For security purposes, it is highly advisable to check that
            //          redirectURI provided by the client matches one registered with
            //          the server.  For simplicity, this example does not.  You have
            //          been warned.
            return done(null, client, redirectURI)
        })
            .catch(err => done(err))
    }), (req, res, next) => {
            Client.findClientById(req.query.client_id)
            .then((client) => {
                if(client != null && client.trustedClient && client.trustedClient === true){
                    server.decision({loadTransaction: false}, (serverReq, callback) => {
                        callback(null, {allow: true})
                    })(req, res, next)
                }
                else{
                    res.render('dialog', {transactionID: req.oauth2.transactionID, user: req.user, client: req.oauth2.client})
                }
            })
            .catch(() => res.render('dialog', {transactionID: req.oauth2.transactionID, user: req.user, client: req.oauth2.client}))
        }
)

// User decision endpoint
router.post('/dialog/authorize/decision',
    login.ensureLoggedIn(),
    server.decision(),
)

// Token endpoint
router.post('/token',
    passport.authenticate(['client'], {session: false}),
    server.token(),
    server.errorHandler()
)

// Endpoint where clients can exchange authorization codes 
// for tokens.
router.get('/exchange', 
    login.ensureLoggedIn(),
    function(req, res) {
        if(req.query.code){
            res.render('exchange', {code: req.query.code})
        }
        else if(req.params.error){
            res.render('exchange')
        }
    }
)

/**
 * Get de página de teste de uso de OAuth 2.0
 */
router.get('/teste',  
    function(req, res){
        res.render('teste', {token: req.query.token})
    }
)

// Register serialization and deserialization
server.serializeClient((client, done) => done(null, client.clientId))

server.deserializeClient((id, done) => {
    Client.findClientById(id)
    .then(client => done(null, client))
    .catch(err => done(err))
})

module.exports = router