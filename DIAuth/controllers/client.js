var Client = require('../models/client')

/**
 * Encontra um Cliente pelo seu ID de Cliente
 */
module.exports.findClientById = function(clientID){
    return Client.findOne({clientId: clientID})
}

/**
 * Encontra um Cliente pelo ID do mongoDB
 */
module.exports.find = function(id){
    return Client.findOne({_id: id})
}

/**
 * Encontra Clientes associados a um username dado
 */
module.exports.findClientByUser = function(username){
    return Client.find({userId: username})
}

/**
 * Cria um novo registo de Cliente
 */
module.exports.insert = function(name, clientId, clientSecret, userId){
    return Client.create({name: name, clientId: clientId, clientSecret: clientSecret, userId: userId})
}