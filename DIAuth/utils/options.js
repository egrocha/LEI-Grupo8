/**
 * Configuração de tokens de acesso
 */
exports.token = {
    expiresIn: 60 * 60,
    calculateExpirationDate: () => new Date(Date.now() + (this.token.expiresIn * 1000))  
}

/**
 * Configuração de token de código
 */
exports.codeToken = {
    expiresIn: 5 * 60
}

/**
 * Configuração de tokens de refresh
 */
exports.refreshToken = {
    expiresIn: 52560000
}