const Client = require('../controllers/client')
const options = require('./options')
const utils = require('./utils')
const process = require('process')
const AccessToken = require('../controllers/accessToken')

const validate = Object.create(null)
const suppressTrace = process.env.OAUTHRECIPES_SURPRESS_TRACE === 'true';

/**
 * Fazer log de uma mensagem e enviá-la como um Error
 */
validate.logAndThrow = (message) => {
    if(!suppressTrace){
        console.trace(message)
    }
    throw new Error(message)
}

/**
 * Dado um código de autorização, um client e um redirectURI,
 * verifica se o código de autorização existe e é válido e 
 * retorna-o caso seja
 */
validate.authCode = (code, authCode, client, redirectURI) => {
    utils.verifyToken(code)
    if(client.clientId !== authCode.clientID){
        validate.logAndThrow('AuthCode clientID does not match client id given')
    }
    if(redirectURI !== authCode.redirectURI){
        validate.logAndThrow('AuthCode redirectURI does not match redirect URI given')
    }
    return authCode
}

/**
 * Gera um token de acesso
 */
validate.generateToken = ({userID, clientID, scope}) => {
    const token = utils.createToken({sub: userID, exp: options.token.expiresIn})
    const expiration = options.token.calculateExpirationDate()
    if(scope === undefined){ 
        scope = '*'
    }
    return AccessToken.insert(token, expiration, userID, clientID, scope)
    .then(() => console.log(token))
    .then(() => token)
}

/**
 * Recebe como argumento um código e gera e devolve
 * um token de acesso.
 */
validate.generateTokens = (authCode) => {
    return Promise.all([validate.generateToken(authCode)])
}

/**
 * Recebe um objeto de cliente e um segredo de cliente e caso
 * o cliente seja válido devolve-o.
 */
validate.client = (client, clientSecret) => {
    validate.clientExists(client)
    if(client.clientSecret !== clientSecret){
        validate.logAndThrow('Client secret does not match')
    }
    return client
}

/**
 * Verifica se um objeto de cliente não é nulo
 */
validate.clientExists = (client) => {
    if(client == null){
        validate.logAndThrow('Client does not exist')
    }
    return client
}

/**
 * Recebe dois tokens e verifica se são válidos. Retorna o 
 * cliente associado ao token.
 */
validate.token = (token, accessToken) => {
    utils.verifyToken(accessToken)
    if(token.clientID !== null){
        return Client.findClientById(token.clientID)
        .then(client => validate.clientExists(client))
        .then(client => client)
    }
}

module.exports = validate