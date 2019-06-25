var bcrypt = require('bcrypt');
var User = require('../models/user');

/* Procura um utilizador no sistema pelo seu email. */
module.exports.getUser = function(email) {
    return User
        .findOne( { username: email } )
        .exec();
}

/* Devolve a lista dos utilizadores. */
module.exports.listar = () => {
    return User
        .find()
        .exec();
}

/* Faz inserção de um novo utilizador na base de dados. */
module.exports.inserir = user => {
    return User.create(user);
}

/* Atualiza registo de utilizador com nome e número. */
module.exports.addInfo = (username, name, number) => {
    return User.findOneAndUpdate({username: username}, {$set:{name: name, number: number}}, {new: true})
}

/* Adiciona ID de conta Google */
module.exports.addGoogle = (username, email) => {
    return User.findOneAndUpdate({username: username}, {$set:{idGoogle: email}}, {new: true})
}

/* Adiciona ID de conta Facebook */
module.exports.addFacebook = (username, id) => {
    return User.findOneAndUpdate({username: username}, {$set: {idFacebook: id}}, {new: true})
}

/* Adiciona ID de conta GitHub */
module.exports.addGithub = (username, id) => {
    return User.findOneAndUpdate({username: username}, {$set: {idGithub: id}}, {new: true})
}

/* Adiciona ID de conta Twitter */
module.exports.addTwitter = (username, id) => {
    return User.findOneAndUpdate({username: username}, {$set: {idTwitter: id}}, {new: true})
}

/* Procura o utilizador com um dado ID Google */
module.exports.checkGoogle = (idGoogle) => {
    return User.find({idGoogle: idGoogle})
}

/* Procura o utilizador com um dado ID Facebook */
module.exports.checkFacebook = (idFacebook) => {
    return User.find({idFacebook: idFacebook})
}

/* Procura o utilizador com um dado ID GitHub */
module.exports.checkGithub = (idGithub) => {
    return User.find({idGithub: idGithub})
}

/* Procura o utilizador com um dado ID Twitter */
module.exports.checkTwitter = (idTwitter) => {
    return User.find({idTwitter: idTwitter})
}

/* Remove um utilizador, dado como objeto como argumento */
module.exports.remove = user => {
    return User.deleteOne(user);
}

/* Muda username de um utilizador */
module.exports.editUsername = (oldUsername, newUsername) => {
    return User.updateOne({ username: oldUsername }, { username: newUsername });
}

/* Muda password de um utilizador */
module.exports.editPassword = (user, pass) => {
    var hash = bcrypt.hashSync(pass, 10);

    return User.updateOne({ username: user }, { password: hash });
}
