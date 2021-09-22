// Aqui implementamos um controle sobre o tipo do usuário logado, se o usuário for admin a requisição é liberada 
// senão dá 401 - não autorizado.

module.exports = middleware => {
    return (req, res, next) => {
        if(req.user.admin) {
            middleware(req, res, next)
        }
        else {
            res.status(401).send('Usuário não autorizado.')
        }
    }
}