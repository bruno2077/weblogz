// Aqui temos o CRUD de categoria de artigos.

module.exports = app => {

    const { existsOrError, notExistsOrError } = app.api.validation
   

    // Função pra salvar ou alterar uma categoria
    const save = async (req, res) => {
        const category = { name: req.body.name }
        category.name = category.name.trim()
        
        // Validação do preenchimento do formulário
        try {
            existsOrError(category.name, 'Nome da categoria não informado')       
            const catByName = await app.db('categories').where({name: category.name}).first()
            if(req.params.id && catByName) {                
                if(parseInt(req.params.id) === catByName.id) { // Se mandou alterar pro mesmo nome que já está, responde OK sem acessar o BD novamente.
                    return res.status(200).send("Categoria atualizada com sucesso")
                }
            }
            notExistsOrError(catByName, 'Categoria já existente')
        } catch(msg) {
            return res.status(400).send(msg)
        }

        // Se veio sem ID é criação, senão é alteração.
        if(req.params.id) { // atualização
            try {                
                //ID já deve existir
                const catById = await app.db('categories').where({id: req.params.id}).first()
                existsOrError(catById, "Código da categoria inválido")                
            }
            catch(msg){
                return res.status(400).send(msg)
            }
            
            category.id = req.params.id
            app.db('categories')
                .update(category)
                .where({ id: category.id })                
                .then(_ => res.status(200).send("Categoria atualizada com sucesso"))
                .catch(err => res.status(500).send(err))
        }

        else { // inclusão            
            app.db('categories')
            .insert(category)
            .then(_ => res.status(200)
            .send("Categoria cadastrada com sucesso"))
            .catch(err => res.status(500).send(err))           
        }
    }


    // Consulta. Função pra consultar 1 ou todas as categorias.
    const get = async (req, res) => {
        if(!req.params.id) { // Get todas
            const categories = await app.db.select('id','name').from('categories')
            try {
                existsOrError(categories, "Não existem categorias cadastradas.")
            }
            catch(msg) {
                return res.status(400).send(msg)
            }
            return res.status(200).send(categories)
        }
        else { // Get by id
            const category = await app.db('categories').where({id: req.params.id}).first()
            try { // se existe
                existsOrError(category, "Categoria inexistente")                
            }
            catch(msg) {
                return res.status(400).send(msg)
            }
            return res.status(200).send(category)
        }
    }


    // Função pra remover uma categoria. A categoria não pode ter artigos cadastrados.
    const catDelete = async (req, res) => {
        // valida se a categoria existe mesmo. (por id)
        try {
            const catById = await app.db('categories').where({id: req.params.id}).first()
            existsOrError(catById, 'Categoria não existe!')
        } catch(msg) {
            return res.status(400).send(msg) 
        }
        
        // Verifica se a categoria possui artigos cadastrados. Se tiver não pode excluir.
        try {
            const isArticles = await app.db('articles').where({categoryId: req.params.id}).first()
            notExistsOrError(isArticles, 'Categoria possui artigo(s), (re)mova todos para excluí-la!')
        } catch(msg) {
            return res.status(400).send(msg)
        }

        // Hard Delete da categoria
        try {
            app.db('categories').where({id: req.params.id}).del()
                .then(_ => {
                    return res.status(200).send(`Categoria excluída com sucesso`)
                })            
        } catch(err) {
            return res.status(500).send(err)
        }
    }

    return { save, get, catDelete }
}