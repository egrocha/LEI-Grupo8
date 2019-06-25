var mongoose = require('mongoose')
var Schema = mongoose.Schema

/**
 * Modelo para tokens de acesso. Guarda o token
 * de acesso, a sua data de expiração, o ID do
 * utilizador que deu autorização, o ID do cliente
 * a quem está a ser dada a autorização e a gama 
 * de dados pedida.
 */
var AccessTokenSchema = new Schema({
    token: {type: String, required: true},
    expirationDate: {type: String, require: true},
    userID: {type: String, required: true},
    clientID: {type: String, required: true},
    scope: {type: String, required: true}
})

module.exports = mongoose.model('AccessToken', AccessTokenSchema, 'accesstokens')