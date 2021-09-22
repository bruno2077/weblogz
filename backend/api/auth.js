// Nesse arquivo tratamos o login de usuário. O usuário se loga e recebe um token expirável, este token diz se o usuário está ou 
// não logado e com isso acessa ou não certas URLs.


const { authSecret } = require('../.env')
const bcrypt = require('bcrypt')
const jwt = require('jwt-simple')

module.exports = app => {

    // Trata a requisicao: Se tá preenchido, Se o email existe, Se a senha do email confere com o db SQL.
    // Cria o payload com 'emitido em' e 'expiração'.
    // Devolve pro front um objeto com o payload e o token de autenticação.
    const login = async (req, res) => {
        // Trata a requisicao: Se tá preenchido, Se o email existe, Se a senha do email confere com o db SQL.
        if(!req.body.email || !req.body.password)
            res.status(400).send('E-mail e/ou senha faltando.')
        
        const user = await app.db('users').where({email: req.body.email}).whereNull('deletedAt').first()        
        if(user) {
            const isPassMatch = bcrypt.compareSync(req.body.password, user.password)
            if(!isPassMatch) {            
                res.status(400).send('E-mail e/ou senha inválidos.')                
            }
        }
        else res.status(400).send('E-mail e/ou senha inválidos.')

        const TimeNow = Math.floor(Date.now() / 1000)

        // cria o payload com 'emitido em' e 'expiração'
        const payload = {
            id: user.id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            admin: user.admin,
            iat: TimeNow,
            exp: TimeNow + (60 * 60 * 7) // tempo em segundos. 7 horas.
        }

        // devolve pro front um objeto com o payload e o token de autenticação
        res.json({ ...payload, token: jwt.encode(payload, authSecret) })
    }


    // Middleware que verifica se o token é válido ou não, retorna true (token válido) ou false (token inválido).
    const validateToken = async (req, res) => {
        const userData = req.body || null
        try {
            if(userData && userData.token) {                
                const token = jwt.decode(userData.token, authSecret)
                if(new Date(token.exp * 1000) > new Date() ) {
                    return res.send(true) // token válido
                }            
            }
        } catch(err) { 
            // problema com o token
        }
        return res.send(false)
    }


    return { login, validateToken }
}