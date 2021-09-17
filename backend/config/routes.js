
module.exports = app => {

    // Adicionar usuário
    app.route('/users')        
        .post(app.api.users.save)
        .get(app.api.users.get)

    // Alterar usuário (incluindo soft delete)
    app.route('/users/:id')
        .put(app.api.users.save)
        .get(app.api.users.get)
        .delete(app.api.users.softDelete)    
}