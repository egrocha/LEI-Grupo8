const fs = require('fs')
const uuid = require('uuid/v4')
const jwt = require('jsonwebtoken')

var privateKey = fs.readFileSync('./certs/diauth.com+3-key.pem', 'utf8')
var publicKey = fs.readFileSync('./certs/diauth.com+3.pem', 'utf8')

/**
 * Cria um JSON Web Token com a chave privada
 */
exports.createToken = ({exp = 3600, sub = ''} = {}) => {
    const token = jwt.sign({
        jti: uuid(),
        sub,
        exp: Math.floor(Date.now() / 1000) + exp,
    }, privateKey, {
        algorithm: 'RS256'
    })
    return token
}

/**
 * Verifica o token através da biblioteca JWT com a chave pública
 */
exports.verifyToken = token => jwt.verify(token, publicKey)