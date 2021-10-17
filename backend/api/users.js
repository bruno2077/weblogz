// Aqui são definidos os métodos de CRUD de usuário.

const bcrypt = require('bcrypt') 

module.exports = app => {

    const { existsOrError, equalsOrError, notExistsOrError } = app.api.validation

    // Função pra criptografar a senha
    const encryptPassword = password => {        
        const salt = bcrypt.genSaltSync(10)
        return bcrypt.hashSync(password, salt) // Este é o hash da senha. É retornado de forma síncrona, sem precisar de callback.
    }

    // Função pra salvar ou alterar um usuário    
    const save = async (req, res) => {
        const user = { ...req.body }        
        
        // Validações do preenchimento do formulário
        try {
            existsOrError(user.name, 'Nome não informado')
            existsOrError(user.email, 'E-mail não informado')
            existsOrError(user.password, 'Senha não informada')
            existsOrError(user.confirmPassword, 'Confirmação de senha não informada')
            equalsOrError(user.password, user.confirmPassword, 'Senhas não conferem')
        } catch(msg) {
            return res.status(400).send(msg)
        }

        // impede que um usuário não logado ou um logado que não é admin crie ou altere usuário pra admin.
        if(!req.user || !req.user.admin) 
            user.admin = false
        

        // impede que um usuário tente alterar outro usuário pela url /home.
        if(req.originalUrl.startsWith('/home')) {
            try {
                equalsOrError(req.user.id, user.id, 'Não autorizado! usuário não é o requerente.')
            } catch(msg) {
                return res.status(401).send(msg)
            }
        }
        // impede que um usuário logado crie um usuário pela URL /register
        else if(req.originalUrl.startsWith('/register')) {
            try {
                notExistsOrError(req.user, 'Não autorizado! usuário já logado.')
            } catch(msg) {
                return res.status(401).send(msg)
            }
        }     

        delete user.confirmPassword
        user.password = encryptPassword(req.body.password)
        

        // Se for novo usuário espera-se que o email não exista, Se for alteração espera-se que o email não exista OU se existir que tenha o mesmo id.
        const userByEmailFromDB = await app.db('users').where({email: user.email}).first()

        // Alteração de usuário já existente.
        if(req.params.id || req.originalUrl.startsWith('/home')) {
            user.id = req.params.id || req.body.id
            const userByIdFromDB = await app.db('users').where({id: user.id}).first()
            try {
                existsOrError(userByIdFromDB, 'Usuário não existe!')
            } catch(msg) {
                return res.status(400).send(msg)
            }

            // Se alterou o email, este novo e-mail não pode já existir.
            if(user.email !== userByIdFromDB.email) {
                try {
                    notExistsOrError(userByEmailFromDB, 'E-mail já cadastrado')
                } catch(msg) {
                    return res.status(400).send(msg)
                }
            }
            // Finalmente altera usuário.
            app.db('users')
                .update(user)
                .where({ id: user.id })
                .whereNull('deletedAt')
                .then(_ => res.status(200).send("Dados do usuário alterados com sucesso"))
                .catch(err => res.status(500).send(err))
        }

        // Inclusão de novo usuário
        else {
            try { // O email do novo usuário não pode já existir.
                notExistsOrError(userByEmailFromDB, 'E-mail já cadastrado')
            } catch(msg) {
                return res.status(400).send(msg)
            }            
            app.db('users').insert(user).then(_ => res.status(200).send("Usuário cadastrado com sucesso")).catch(err => res.status(500).send(err))
        }
    }


    // Consulta. Retorna todos os usuários sem paginação, ou retorna 1 usuário.
    const get = async (req, res) => {
        if(!req.params.id) {
            const users = await app.db.select('id','name', 'email', 'avatar', 'admin').from('users').whereNull('deletedAt')          
            res.send(users)
        }
        else {
            const user = await app.db.select('id', 'name', 'email', 'avatar', 'admin').from('users').where({ id: req.params.id }).whereNull('deletedAt').first()
            try {
                existsOrError(user, 'Usuário não existe!')
            } catch(msg) {
                return res.status(400).send(msg)
            }
            res.status(200).send(user)  
        }
    }

    // Preenche o campo deletedAt e assim fica invisível para método get acima.
    const softDelete = async (req, res) => {
        const user = await app.db('users').where({id: req.params.id}).first()
        try {
            existsOrError(user, 'Usuário não existe!')
        } catch(msg) {
            res.status(400).send(msg) 
        }        
        
        // Fuso horário do servidor
        const serverTimeZone = -(new Date().getTimezoneOffset() / 60)
        const serverNow = new Date()

        // No SQL é pra ter este formato: "2012-08-24 14:00:00 +02:00"
        const nowInSQLTimestampType = `${serverNow.getFullYear()}-${serverNow.getMonth()+1}-${serverNow.getDate()} ${serverNow.getHours()}:${serverNow.getMinutes()}:${serverNow.getSeconds()} ${serverTimeZone}`
        // console.log(nowInSQLTimestampType)

        try {
            await app.db('users').where({id: req.params.id}).update({ deletedAt: nowInSQLTimestampType })
            const testTimeSQL = await app.db('users').where({id: req.params.id}).select('deletedAt').first()
            // console.log(`${testTimeSQL.deletedAt}`)
            return res.status(200).send(`Usuário deletado nesse horário: ${ testTimeSQL.deletedAt }`)
        } catch(err) {
            return res.status(500).send(err)
        }
    }
    

    return { save, get, softDelete }
}