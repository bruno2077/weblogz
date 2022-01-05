const admin = require('./admin.js')

module.exports = app => {

    // URLs públicas. as únicas que não estão sujeitas a validação do token
    app.post('/register', app.api.users.save) // Adicionar usuário pela área pública
    app.post('/login', app.api.auth.login) // loga na aplicação
    app.post('/validateToken', app.api.auth.validateToken) // valida o token de usuário já logado
    app.get('/categories',app.api.categories.get) // get todas categorias
    app.get('/categories/:id',app.api.categories.get) // get 1 categoria pelo id
    app.get('/articles/p',app.api.articles.get) // get artigos público. Pode filtrar por categoria e faz pesquisa usando querryStrings.
    app.get('/articles/:id',app.api.articles.getOne) // get 1 artigo pelo id.

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
        .all(app.config.passport.authenticate())        
        .put(app.api.users.save) // altera o próprio usuário 
        .get(app.api.articles.getByX) // Retorna os artigos de autoria do próprio usuário.

    // Pra salvar, alterar e deletar categorias o usuário deve estar autenticado e ser administrador.
    app.post('/categories', app.config.passport.authenticate(), admin(app.api.categories.save)) // adiciona categoria    
    app.put('/categories/:id', app.config.passport.authenticate(), admin(app.api.categories.save)) // altera categoria
    app.delete('/categories/:id', app.config.passport.authenticate(), admin(app.api.categories.catDelete)) // deleta categoria

    // Pra salvar, alterar e deletar artigos o usuário basta estar autenticado, não precisa ser admin.
    app.get('/articles', app.config.passport.authenticate(), app.api.articles.getByX) // get todas categorias conforme os filtros.
    app.post('/articles', app.config.passport.authenticate(), app.api.articles.save) // adiciona artigo    
    app.put('/articles/:id', app.config.passport.authenticate(), app.api.articles.save) // altera artigo
    app.delete('/articles/:id', app.config.passport.authenticate(), app.api.articles.artDelete) // deleta artigo
}