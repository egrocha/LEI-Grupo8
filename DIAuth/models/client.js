var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * Modelo de Clientes, guarda o nome, ID, segredo de 
 * Cliente o username do utilizador que registou 
 * o Cliente.
 */
var ClientSchema = new Schema({
    name: {type: String, required: true},
    clientId: {type: String, required: true, unique: true},
    clientSecret: {type: String, required: true},
    userId: {type: String, required: true}
});

module.exports = mongoose.model('Client', ClientSchema, 'clients');