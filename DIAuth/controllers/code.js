var Code = require('../models/code')
const jwt = require('jsonwebtoken')

/* Guarda um código de autorização */
module.exports.save = (code, clientID, redirectURI, userID, scope) => {
    const id = jwt.decode(code).jti
    var newCode = {id, clientID, redirectURI, userID}
    return Code.create(newCode)
}

/* Elimina um código de autorização */
module.exports.delete = (token) => {
    const id = jwt.decode(token).jti
    return Code.findOneAndDelete({id: id})
}