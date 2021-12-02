// Aqui temos o CRUD de artigos. Tem que tomar vários cuidados já que qualquer um registrado pode "CRUDar" os artigos e usuários não 
// registrados podem fazer várias consultas e até pesquisa.


module.exports = app => {

    const { existsOrError, equalsOrError } = app.api.validation

    // Função pra salvar ou alterar um artigo. A autoria do artigo é do usuário logado. Nem admin cria artigo no nome dos outros.
    // São 9 colunas: id, created_at, updated_at, title, description, content, published, userId, categoryId
    // Inclusão de novo artigo pede 6:  title, description, content, published, userId, categoryId
    // Aklteração de artigo, pede 5:    title, description, content, published, categoryId
    const save = async (req, res) => {       
        const article = { ...req.body }

        if(req.params.id) // Alteração de artigo
            article.id = req.params.id
        else { // Criação de artigo
            delete article.id // Evita de pegar qualquer ID passado pelo frontend.
            article.userId = req.user.id // Pega o usuário logado como autor do artigo.
        }

        // Validações do preenchimento do formulário
        try {
            existsOrError(article.title, 'Título não informado')
            existsOrError(article.description, 'Descrição não informada')
            existsOrError(article.content, 'Artigo sem conteúdo')
            existsOrError(article.categoryId, 'Categoria de artigo não informada')
        } catch(msg) {
            return res.status(400).send(msg)
        }        
        article.published = article.published ? true : false // força valor boolean        

        // Verifica se a categoria existe.
        const categoryFromDB = await app.db('categories').where({id: article.categoryId}).first()        
        try {
            existsOrError(categoryFromDB, 'Categoria de artigo não existe.')            
        } catch(msg) {
            return res.status(400).send(msg)
        }

        // O trecho abaixo é pra pegar o horário atual pra uso na criação ou atualização do artigo.
        const serverTimeZone = -(new Date().getTimezoneOffset() / 60)
        const serverNow = new Date()
        // No SQL é pra ter este formato: "2012-08-24 14:00:00 +02:00"
        const nowInSQLTimestampType = `${serverNow.getFullYear()}-${serverNow.getMonth()+1}-${serverNow.getDate()} ${serverNow.getHours()}:${serverNow.getMinutes()}:${serverNow.getSeconds()} ${serverTimeZone}`
        

        // CADASTRO
        // Qualquer usuário registrado pode criar artigos.
        if(!article.id) {     
            const okMsg = article.published ? "Artigo publicado com sucesso" : "Rascunho salvo com sucesso"            
            article.created_at = article.updated_at = nowInSQLTimestampType

            app.db('articles')
                .insert(article)
                .then(_ => res.status(200).send(okMsg))
                .catch(err => res.status(500).send(err))
        }
        
        // ALTERAÇÃO        
        // Atualiza colunas específicas. Não pode alterar autor nem data de criação.
        else {       
            // Verifica se o artigo já existe mesmo            
            const articleFromDB = await app.db('articles').where({id: article.id}).first()
            try {            
                existsOrError(articleFromDB, 'Artigo não existe.')
            } catch(msg) {
                return res.status(400).send(msg)
            }

            // usuário só altera artigo de outro usuário ser for admin.
            if(!req.user.admin) {
                try {                    
                    equalsOrError(req.user.id, articleFromDB.userId, 'Não autorizado! usuário não é o autor.')
                } catch(msg) {
                    return res.status(401).send(msg)
                }
            }
            
            // Pra só alterar o necessário: title, description, content, published, categoryId, updated_at
            article.updated_at = nowInSQLTimestampType
            const {title, description, published, categoryId, updated_at} = article            

            const content = JSON.stringify(article.content)
            
            app.db('articles')                
                .update({title, description, content, published, categoryId, updated_at})
                .where({id: article.id})
                .then(_ => res.status(200).send("Alterações salvas com sucesso"))
                .catch(err => res.status(500).send(err))
        }
    }


    // Consulta. Retorna 1 artigo pelo ID.
    const getOne = async (req, res) => {
        try {
            const article = await app.db('articles').where({id: req.params.id}).first()
            try { // se existe
                existsOrError(article, "Artigo não existe ou foi excluído.")
            }
            catch(msg) {
                return res.status(400).send(msg)
            }
            article.content = JSON.parse(article.content)
            return res.status(200).send(article)
        } catch(msg) {
            return res.status(500).send(msg)
        }
    }
    
    
    // Consulta paginada e pesquisa. Essa função retorna uma pesquisa paginada de todos os artigos ou de uma categoria
    // podendo ou não ser com uma busca nos títulos dos artigos. Só mostra artigos publicados.
    const get = async (req, res) => {
        if(req.query.q && req.query.q.length < 3) // Validação da pesquisa. Mínimo 3 caracteres.
            return res.status(400).send("A pesquisa deve ter no mínimo 3 caracteres.")
        
        // Qtde de resultados por página. Por padrão 5. Trás no maximo 10 e no mínimo 3 resultados.
        let limit = 5        
        if(parseInt(req.query.lim) && parseInt(req.query.lim) > 2 && parseInt(req.query.lim) < 11)
            limit = parseInt(req.query.lim)

        // Coluna de ordenação. Ordena por data de atualização (que é o padrão) ou data de criação. 
        const orderBy =  parseInt(req.query.col) ? "updated_at" : "created_at"
                
        let categoryById = null
        // Aqui define se faz get dos artigos apenas de 1 categoria escolhida ou se faz de todas normalmente.
        if(req.query.cat) {
            // valida se a categoria existe.
            const isCategory = await app.db("categories").where({name: req.query.cat}).first()
            if(isCategory)
                categoryById = isCategory.id
        }

        let page, entries, count

        if(categoryById !== null) { //conta o numero de artigos da categoria escolhida, com ou sem pesquisa.
            if(req.query.q)
                entries = await app.db('articles').where({categoryId: categoryById}).andWhere('title', 'like', `%${req.query.q}%`).andWhere({published: true}).count('id').first()
            else entries = await app.db('articles').where({categoryId: categoryById}).count('id').first()
        }
        else { //conta numero de artigos no total, com ou sem pesquisa
            if(req.query.q)
                entries = await app.db('articles').where('title', 'like', `%${req.query.q}%`).andWhere({published: true}).count('id').first()
            else entries = await app.db('articles').count('id').first()
        }
        count = entries.count // o número de registros.
                
        // Número da página. Se não tiver setado ou for inválido a página 1 é a padrão.
        page = 1
        if(parseInt(req.query.page) && parseInt(req.query.page) > 0 && parseInt(req.query.page) <= (count / limit))
            page = parseInt(req.query.page)


        if(categoryById !== null) { // Get dos artigos só da categoria escolhida.
            app.db('articles')
                .select('id', 'title', 'description', "created_at", "updated_at", "published", "userId")
                .where("categoryId", categoryById)
                .andWhere({published: true})
                .modify(function(queryBuilder) {
                    if (req.query.q) {
                        queryBuilder.andWhere('title', 'like', `%${req.query.q}%`);
                    }
                })   
                .orderBy(orderBy, "asc")
                .limit(limit).offset(page * limit - limit)
                .then(articles => res.json({ data: articles, count, limit, category: req.query.cat }))
                .catch(err => res.status(500).send(err) )
        }         
        else { // Get de artigos de todas categorias.            
            app.db('articles')
            .select('id', 'title', 'description', "created_at", "updated_at", "published", "userId", "categoryId")
            .where({published: true})
            .modify(function(queryBuilder) {
                if (req.query.q) {
                    queryBuilder.where('title', 'like', `%${req.query.q}%`);
                }
            }) 
            .orderBy(orderBy, "asc")
            .limit(limit).offset(page * limit - limit)
            .then(articles => res.json({ data: articles, count, limit }))
            .catch(err => res.status(500).send(err) )
        }            
    }


    // Consulta paginada ordenada por qualquer coluna. É acessivel por admins pra listar tudo e pela home do usuário onde retorna somente 
    // os seus artigos.
    const getByX = async (req, res) => {
        // Qtde de resultados por página. Por padrão 10. Trás no maximo 20 e no mínimo 5 resultados.
        let limit = 10        
        if(parseInt(req.query.lim) && parseInt(req.query.lim) > 4 && parseInt(req.query.lim) < 21)
            limit = parseInt(req.query.lim)

        // Coluna de ordenação. Se não tiver setado ou for inválida, por padrão ordena por updated_at.
        let columnName = "updated_at"
        if(req.query.col) {
            const isColumn = await app.db.schema.hasColumn("articles", `${req.query.col}`) // true ou false
            if(isColumn)
                columnName = req.query.col
        }

        let page, entries, count // Variáveis pra definir o número da página e a quantidade de registros no banco de dados.

        // Quantos registros tem na tabela. Serve pra saber quantas páginas vamos gerar baseado na qtde de linhas da tabela.
        if(req.originalUrl.startsWith('/home')) {
            entries = await app.db('articles').where({userId: req.user.id}).count('id').first()
        }
        else {
            entries = await app.db('articles').count('id').first()
        }
        count = entries.count // o número de registros.
        
        // Número da página. Se não tiver setado ou for inválido a página 1 é a padrão.
        page = 1
        if(parseInt(req.query.page) && parseInt(req.query.page) > 0 && parseInt(req.query.page) <= (count / limit))
            page = parseInt(req.query.page)


        // O caminho a seguir é pra uso no /home do back e /perfil do front onde é pra retornar todos os artigos do req.user. paginado também.
        if(req.originalUrl.startsWith('/home')) {
            // A consulta paginada. Retornamos um objeto com os artigos sem a coluna content, a variavel count e a variavel limit. Ambas 
            // variaveis tambem são importantes no front pra montar a paginação.
            app.db('articles')
                .select('id', 'title', 'description', "created_at", "updated_at", "published", "categoryId")
                .where("userId", req.user.id)
                .orderBy(columnName, "asc")
                .limit(limit).offset(page * limit - limit)
                .then(articles => res.json({ data: articles, count, limit }))
                .catch(err => res.status(500).send(err) )
        }
        
        // O caminho abaixo é pra uso no '/admin/articles' do front. Retorna registros paginado e na ordem da coluna desejada.
        else {
            // A consulta paginada. Retornamos um objeto com os artigos sem a coluna content, a variavel count e a variavel limit. Ambas 
            // variaveis tambem são importantes no front pra montar a paginação.
            app.db('articles')
            .select('id', 'title', 'description', "created_at", "updated_at", "published", "userId", "categoryId")
            .orderBy(columnName, "asc")
            .limit(limit).offset(page * limit - limit)
            .then(articles => res.json({ data: articles, count, limit }))
            .catch(err => res.status(500).send(err) )
        }
    }


    // Deleta um artigo. Usuários fazem deleção pela URL '/articles/:id-do-artigo'
    const artDelete = async (req, res) => {
        try {
            const artById = await app.db('articles').where({id: req.params.id}).first()
            // valida se o artigo existe mesmo. (por id)
            try {            
                existsOrError(artById, 'Artigo não existe!')            
            } catch(msg) {
                return res.status(400).send(msg) 
            }
            
            // valida se o usuário é o autor OU se é admin
            try {            
                if(!req.user.admin)
                    equalsOrError(req.user.id, artById.userId, 'Não autorizado! usuário não é o autor.')

            } catch(msg) {
                return res.status(400).send(msg)
            }

            // Hard Delete do artigo
            try {
                app.db('articles').where({id: req.params.id}).del()
                    .then(_ => {
                        return res.status(200).send(`Artigo excluído com sucesso`)
                    })            
            } catch(err) {
                return res.status(500).send(err)
            }
        }
        catch(msg) {
            res.status(500).send(msg)
        }
    }
    
    return { save, getOne, get, getByX, artDelete }
}