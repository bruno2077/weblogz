// Aqui validamos o token criado no login (auth.js) usando passport. No front, após o login o token é colocado no header de cada requisição
// e em cada requisição o método que aqui exportamos (authenticate) faz a validação deste token. O token pode estar OK, expirado, não 
// existir, etc, se o token for válido a requisição é atendida se não dá erro 401 - Não autorizado.

const { authSecret } = require('../.env')
const passport = require('passport')
const { Strategy, ExtractJwt } = require('passport-jwt')

module.exports = app => {
    // Objeto usado na estratégia.
    const params = {
        secretOrKey: authSecret, // A chave secreta
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken() // o Token no cabeçalho da requisição
    }

    // A estratégia da autenticação. Usa aquele mesmo payload que criamos no login, o token no cabeçalho da requisição e a chave secreta.
    // obtém o usuário, chama o próximo middleware passando payload ou retorna falso se não tiver achado o usuário ou se tiver dado erro.
    const strategy = new Strategy(params, (payload, done) => {
        app.db('users')
            .where({ id: payload.id })
            .first()
            .then(user => done(null, user ? {...payload} : false) )
            .catch(err => done(err,  false) )
    })

    // Define a estratégia à aplicar nas requisições.
    passport.use(strategy)

    return {
        // Exportamos este método. Usando o passport, faz a autenticação da requisição com a estratégia jwt e nenhum controle de sessão.
        authenticate: () => passport.authenticate('jwt', {session: false } )
    }
}