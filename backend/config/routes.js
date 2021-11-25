
const admin = require('./admin.js')

module.exports = app => {

    // URLs públicas. as únicas que não estão sujeitas a validação do token
    app.post('/register', app.api.users.save) // Adicionar usuário pela área pública
    app.post('/login', app.api.auth.login) // loga na aplicação
    app.post('/validateToken', app.api.auth.validateToken) // valida o token de usuário já logado
    app.get('/categories',app.api.categories.get) // get todas categorias
    app.get('/categories/:id',app.api.categories.get) // get 1 categoria pelo id
    

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


    app.post('/categories', app.config.passport.authenticate(), admin(app.api.categories.save)) // adiciona categoria    
    app.put('/categories/:id', app.config.passport.authenticate(), admin(app.api.categories.save)) // altera categoria
    app.delete('/categories/:id', app.config.passport.authenticate(), admin(app.api.categories.catDelete)) // deleta categoria
}