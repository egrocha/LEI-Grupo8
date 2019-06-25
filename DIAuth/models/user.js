var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var Schema = mongoose.Schema;

/**
 * Modelo de Utilizadores, guarda o username, password,
 * nome e número mecanográfico. Pode, opcionalmente, ter 
 * o ID de Google, Facebook, GitHub ou Twitter do utilizador.
 */
var UserSchema = new Schema({
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    name: {type: String},
    number: {type: String},
    idGoogle: {type: String, required: false},
    idFacebook: {type: String, required: false},
    idGithub: {type: String, required: false},
    idTwitter: {type: String, required: false}
});

/**
 * Cifra a password antes de ser armazenada na base de 
 * dados.
 */
UserSchema.pre('save', async function(next) {
    var hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
    next();
});

/**
 * Compara uma password dada com a password presente na 
 * base de dados.
 */
UserSchema.methods.isValidPassword = async function(password) {
    var user = this; 
    var compare = await bcrypt.compare(password, user.password);
    return compare;
}

module.exports = mongoose.model('User', UserSchema, 'users');