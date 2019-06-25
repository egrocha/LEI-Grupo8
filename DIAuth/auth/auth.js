var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var JWTStrategy = require('passport-jwt').Strategy;
const {Strategy: ClientPasswordStrategy} = require('passport-oauth2-client-password')
const {Strategy: BearerStrategy} = require('passport-http-bearer')
var ExtractJWT = require('passport-jwt').ExtractJwt;
var User = require('../models/user');
const Client = require('../controllers/client')
const validate = require('../utils/validate')
const AccessToken = require('../controllers/accessToken')

/* Registo de um utilizador. */
passport.use('signup', new LocalStrategy({
    usernameField: 'username', 
    passwordField: 'password',
}, async(username, password, done) => {
    try {
        var user = await User.create({username, password})
        return done(null, user)
    } catch (error) {
        return done(error)
    }
}));

/* Login de utilizadores. */
passport.use('login', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
}, async(username, password, done) => {
    try{
        var user = await User.findOne({username})
        console.log(user)
        if(!user){
            return done(null, false, { message: 'Utilizador não existe' })
        }
        var valid = await user.isValidPassword(password)
        if(!valid){
            return done(null, false, {message: 'Password inválida'})    
        }
        return done(null, user, {message: 'Login feito com sucesso'})
    } catch(error){
        return done(error)
    }
}));

/**
 * Autenticação de utilizadores que fazem login por 
 * um dos métodos alternativos: Google, Facebook, Twitter 
 * ou GitHub 
 */
passport.use('alt', new LocalStrategy({
    usernameField: 'username'
}, async(username, done) => {
    try {
        var user = await User.findOne({username});
        if(!user){
            return done(null, false, { message: 'Utilizador não existe' });
        }
        return done(null, user, { message: 'Login feito com sucesso' });
    } catch (error) {
        return done(error);
    }
}));

/**
 * Autenticação de clientes, com o ID e segredo
 * do Cliente
 */
passport.use('client', new ClientPasswordStrategy((clientId, clientSecret, done) => {
    Client.findClientById(clientId)
    .then(client => validate.client(client, clientSecret))
    .then(client => done(null, client))
    .catch(() => done(null, false))
}))

/**
 * Autenticação com token de acesso. Verifica se token
 * existe e se é válido antes de completar o processo
 */
passport.use('bearer', new BearerStrategy((accessToken, done) => {
    AccessToken.checkToken(accessToken)
    .then(token => validate.token(token, accessToken))
    .then(token => done(null, token, {scope: '*'}))
    .catch(() => done(null, false))
}))

/** Extrai o token da sessão e devolve-o */
var extractFromSession = function(req) {
    var token = null;
    if (req && req.session) 
        token = req.session.token;
    
    return token;
}

/** Estratégia passport para JSON Web Tokens */
passport.use(new JWTStrategy({
    secretOrKey: 'lei',
    jwtFromRequest: ExtractJWT.fromExtractors([extractFromSession])
}, async(token, done) => {
    try {
        return done(null, token.user);
    } catch (error) {
        return done(error);
    }
}))

/** Função de serialização de utilizadores */
passport.serializeUser(function(user, done) {
  done(null, user);
});

/** Função de deserialização de utilizadores */
passport.deserializeUser(function(user, done) {
  done(null, user);
});
