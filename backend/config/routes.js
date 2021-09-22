
const admin = require('./admin.js')

module.exports = app => {

    // URLs públicas. as únicas que não estão sujeitas a validação do token
    app.post('/register', app.api.users.save) // Adicionar usuário pela área pública
    app.post('/login', app.api.auth.login) // loga na aplicação
    app.post('/validateToken', app.api.auth.validateToken)
    

    app.route('/users')     
        .all(app.config.passport.authenticate())
        .post(admin(app.api.users.save)) // Adicionar usuário pela área logada
        .get(admin(app.api.users.get)) // get todos os usuários
    
    app.route('/users/:id')
        .all(app.config.passport.authenticate())
        .put(admin(app.api.users.save)) // Alterar um usuário
        .get(admin(app.api.users.get)) // get usuário pelo id
        .delete(admin(app.api.users.softDelete)) // Soft delete de um usuário

    app.route('/home')
        .all(app.config.passport.authenticate() )        
        .put(app.api.users.save) // altera o próprio usuário 
}