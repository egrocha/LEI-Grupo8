const AccessToken = require('../models/accessToken')

/** 
 * Verifica se token existe na base de dados
 */
module.exports.checkToken = function(accessToken){
    return AccessToken.findOne({token: accessToken})
}

/**
 * Cria um objeto novo com os parâmetros dados 
 * e insere-o na base de dados
 */
module.exports.insert = function(token, expirationDate, userID, clientID, scope){
    const newToken = {token, expirationDate, userID, clientID, scope}
    return AccessToken.create(newToken)
}
