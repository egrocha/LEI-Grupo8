var mongoose = require('mongoose')
var Schema = mongoose.Schema

/**
 * Modelo de códigos de autorização, guarda o ID do 
 * código, ID de cliente a quem é entregue o código,
 * link de redirecionamento do cliente e ID do utilizador
 * que deu autorização.
 */
var CodeSchema = new Schema({
    id: {type: String, required: true, unique: true},
    clientID: {type: String, required: true},
    redirectURI: {type: String, required: true},
    userID: {type: String, required: true},
})

module.exports = mongoose.model('Code', CodeSchema, 'codes')