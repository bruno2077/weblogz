
const bcrypt = require('bcrypt') // isso serve pra criptografar a senha de usuário sempre que salvar/alterar um usuário.

module.exports = app => {

    const { existsOrError, equalsOrError, notExistsOrError } = app.api.validation    

    // Função pra criptografar a senha
    const encryptPassword = password => {        
        const salt = bcrypt.genSaltSync(10)
        return bcrypt.hashSync(password, salt) // Este é o hash da senha. É retornado de forma síncrona, sem precisar de callback.
    }

    // Função pra salvar ou alterar um usuário
    // V.atual: Criação e alteração simples. Não tem nada de segurança, qq1 pode criar admin, alterar pra admin, alterar qq usuário.
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
            res.status(400).send(msg)
        }

        delete user.confirmPassword
        user.password = encryptPassword(req.body.password)

        // Se for novo usuário espera-se que o email não exista, Se for alteração espera-se que o email não exista OU se existir que tenha o mesmo id.
        const userByEmailFromDB = await app.db('users').where({email: user.email}).first()

        // Alteração de usuário já existente.
        if(req.params.id) { 
            user.id = req.params.id
            const userByIdFromDB = await app.db('users').where({id: user.id}).first()
            try {
                existsOrError(userByIdFromDB, 'Usuário não existe!')
            } catch(msg) {
                res.status(400).send(msg)
            }           

            // Se alterou o email, este novo e-mail não pode já existir.
            if(user.email !== userByIdFromDB.email) {                
                try {
                    notExistsOrError(userByEmailFromDB, 'E-mail já cadastrado')
                } catch(msg) {
                    res.status(400).send(msg)
                }           
            }
            // Finalmente altera usuário
            app.db('users')
                .update(user)
                .where({ id: user.id })
                .whereNull('deletedAt')
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        }

        // Inclusão de novo usuário
        else {    
            try { // O email do novo usuário não pode já existir.
                notExistsOrError(userByEmailFromDB, 'E-mail já cadastrado')
            } catch(msg) {
                res.status(400).send(msg)
            }            
            app.db('users').insert(user).then(_ => res.status(204).send()).catch(err => res.status(500).send(err))
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
                res.status(400).send(msg)
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
        
        // https://stackoverflow.com/questions/5129624/convert-js-date-time-to-mysql-datetime
        // https://stackoverflow.com/questions/10830357/javascript-toisostring-ignores-timezone-offset
        
        
        /* CHECKPOINT //
        // Está funcionando (se por numa templatestring) mas falta por os minutos no serverTimeZone já que fuso-horário é de meia em meia hora.
        // Outra coisa, é bom forçar 2 dígitos nesses campos, talvez tem função JS pronta ou faz na unha. */
        const serverTimeZone = -(new Date().getTimezoneOffset() / 60) // FALTA OS MINUTOS. 
        const serverNow = new Date()
        // No SQL é pra ter este formato: "2012-08-24 14:00:00 +02:00"
        const nowInSQLTimestampType = `${serverNow.getFullYear()}-${serverNow.getMonth()+1}-${serverNow.getDate()} ${serverNow.getHours()}:${serverNow.getMinutes()}:${serverNow.getSeconds()} ${serverTimeZone}`
        // console.log(`${serverNow.getFullYear()}-${serverNow.getMonth()+1}-${serverNow.getDate()} ${serverNow.getHours()}:${serverNow.getMinutes()}:${serverNow.getSeconds()} ${serverTimeZone}`)
        
        try{ 
            // await app.db('users').where({id: req.params.id}).update({ deletedAt: "2012-08-24 14:00:00 +02:00" }) // ASSIM DEU CERTO! tem q botar a timezone quem sabe uns concat e tal.
            await app.db('users').where({id: req.params.id}).update({ deletedAt: nowInSQLTimestampType }) 
        } catch(err) {
            res.status(500).send(err)
        }
        
        // var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
        // var localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1); // => '2015-01-26T06:40:36.181'
        
        const testTimeSQL = await app.db('users').where({id: req.params.id}).select('deletedAt').first()
        console.log(`${testTimeSQL.deletedAt}`)
        res.status(200).send(`deletado nesse horário: ${ testTimeSQL.deletedAt }`)
    }

    
    // Penso em chamar essa depois de x dias/minutos após o soft delete... ai seria uma boa criar uma função de recuperação de conta, 
    // seja num botão só pra isso e/ou numa tentativa de criar um user deletedAt e/ou tentar logar com user deletedAt.
    // hmmm emails de confirmação? e recuperação de senha?! 
    const hardDelete = (req, res) => {

    }


    return { save, get, softDelete, hardDelete }
}