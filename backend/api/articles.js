// Aqui temos o CRUD de artigos. Tem que tomar vários cuidados já que qualquer um registrado pode "CRUDar" os artigos e usuários não 
// registrados podem fazer várias consultas.


module.exports = app => {

    const { existsOrError, equalsOrError } = app.api.validation

    // Função pra salvar ou alterar um artigo. A autoria do artigo é do usuário logado. Nem admin cria artigo no nome dos outros.
    // São 9 colunas: id, created_at, updated_at, title, description, content, published, userId, categoryId
    // Inclusão de novo artigo pede 6:  title, description, content, published, userId, categoryId
    // Alteração de artigo, pede 5:    title, description, content, published, categoryId
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
            if(article.published)
                article.created_at = article.updated_at = nowInSQLTimestampType
            else {
                delete article.created_at
                delete article.updated_at
            }

            app.db('articles')
                .insert(article)
                .then(_ => res.status(200).send(okMsg))
                .catch(err => res.status(500).send(err))
        }
        
        // ALTERAÇÃO        
        // Atualiza colunas específicas. Não pode alterar autor nem a data de criação a menos que esta seja nula.
        else {       
            // Verifica se o artigo já existe mesmo            
            const articleFromDB = await app.db('articles').where({id: article.id}).first()
            try {            
                existsOrError(articleFromDB, 'Artigo não existe.')
            } catch(msg) {
                return res.status(400).send(msg)
            }

            // usuário só altera artigo de outro usuário se for admin.
            if(!req.user.admin) {
                try {                    
                    equalsOrError(req.user.id, articleFromDB.userId, 'Não autorizado! usuário não é o autor.')
                } catch(msg) {
                    return res.status(401).send(msg)
                }
            }
            
            // Garante que só altera o necessário: title, description, content, published, categoryId, updated_at. 
            // Se o artigo nunca foi publicado created_at também.
            let fieldsToUpdate
            article.updated_at = nowInSQLTimestampType            
            if(!articleFromDB.created_at) {
                article.created_at = nowInSQLTimestampType                
                const {title, description, content, published, categoryId, updated_at, created_at} = article
                fieldsToUpdate = {title, description, content, published, categoryId, updated_at, created_at} 
            }
            
            else {
                const {title, description, content, published, categoryId, updated_at} = article
                fieldsToUpdate = {title, description, content, published, categoryId, updated_at}
            }
            
            app.db('articles')                
                .update(fieldsToUpdate)
                .where({id: article.id})
                .then(_ => res.status(200).send("Alterações salvas com sucesso"))
                .catch(err => res.status(500).send(err))
        }
    }


    // Consulta. Retorna 1 artigo pelo ID e também manda nome e avatar do autor já que a busca por usuário só admin tem permissão.
    const getOne = async (req, res) => {
        try {
            const article = await app.db('articles').where({id: req.params.id}).first()
            try {
                existsOrError(article, "Artigo não existe ou foi excluído.")
            }
            catch(msg) {
                return res.status(400).send(msg)
            }
            const author = await app.db.select('name','avatar').from('users').where({id: article.userId}).first()
            
            article.content = JSON.parse(article.content)
            author.avatar = author.avatar.toString()
            
            return res.status(200).send({article, author})
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
            else return res.status(400).send("Categoria inexistente.")
        }

        const ascdesc = req.query.asc === "1" ? "asc" : "desc" // ordem ascendente ou descendente. Por padrão é desc 

        let page, entries, count

        if(categoryById !== null) { //conta o numero de artigos da categoria escolhida, com ou sem pesquisa.
            if(req.query.q)
                entries = await app.db('articles').where({categoryId: categoryById}).andWhere('title', 'like', `%${req.query.q}%`).andWhere({published: true}).count('id').first()
            else entries = await app.db('articles').where({categoryId: categoryById}).andWhere({published: true}).count('id').first()
        }
        else { //conta numero de artigos no total, com ou sem pesquisa
            if(req.query.q)
                entries = await app.db('articles').where('title', 'like', `%${req.query.q}%`).andWhere({published: true}).count('id').first()
            else entries = await app.db('articles').where({published: true}).count('id').first()
        }
        count = entries.count // o número de registros.
                
        // Número da página. Se não tiver setado ou for inválido a página 1 é a padrão.
        page = 1
        if(parseInt(req.query.page) && parseInt(req.query.page) > 0 && parseInt(req.query.page) <= Math.ceil(count / limit))
            page = parseInt(req.query.page)

        if(categoryById !== null) { // Get dos artigos só da categoria escolhida.
            await app.db('articles')
                .join('users', 'users.id', 'articles.userId')
                .select('articles.id', 'title', 'description', "created_at", "updated_at", "published", "userId", app.db.raw("users.name as author"), app.db.raw("users.avatar as authorAvatar"))
                .where("categoryId", categoryById)
                .andWhere({published: true})
                .modify(function(queryBuilder) {
                    if (req.query.q) {
                        queryBuilder.andWhere('title', 'like', `%${req.query.q}%`);
                    }
                })   
                .orderBy(orderBy, ascdesc)
                .limit(limit).offset(page * limit - limit)
                .then(articles => {                    
                    articles.forEach(el => {
                        el.authoravatar = el.authoravatar.toString()                        
                    })
                    res.json({data: articles, count, limit, page, category: req.query.cat})
                })
                .catch(err => res.status(500).send(err) )
        }         
        else { // Get de artigos de todas categorias OU é resultado de busca.
            await app.db('articles')
                .join('users', 'users.id', 'articles.userId')
                .select('articles.id', 'title', 'description', "created_at", "updated_at", "published", "categoryId", "userId", app.db.raw("users.name as author"), app.db.raw("users.avatar as authorAvatar"))
                .where({published: true})
                .modify(function(queryBuilder) {
                    if (req.query.q) {
                        queryBuilder.where('title', 'like', `%${req.query.q}%`);
                    }
                }) 
                .orderBy(orderBy, ascdesc)
                .limit(limit).offset(page * limit - limit)                
                .then(articles => {
                    articles.forEach(el => {
                        el.authoravatar = el.authoravatar.toString()                        
                    })
                    res.json({ data: articles, count, limit, page, q: req.query.q ? req.query.q : null })
                })               
                .catch(err => res.status(500).send(err) )
        }            
    }


    // Consulta paginada ordenada por qualquer coluna. É acessivel por admins pra listar tudo numa tabela e pela home do usuário 
    // pra listar apenas os seus artigos numa tabela.    
    const getByX = async (req, res) => {
        // Qtde de resultados por página. Por padrão 5. Trás no maximo 20 e no mínimo 3 resultados.
        let limit = 5
        if(parseInt(req.query.lim) && parseInt(req.query.lim) > 2 && parseInt(req.query.lim) < 21) 
            limit = parseInt(req.query.lim)        

        // Coluna de ordenação. Se não tiver setado ou a coluna não existir, por padrão ordena por updated_at.
        let columnName = "updated_at"
        if(req.query.col && (req.query.col === "author" || req.query.col === "categoryname") ) { // colunas criadas no momento da pesquisa via join das tabelas.
            columnName = req.query.col
        }
        else if(req.query.col) {
            const isColumn = await app.db.schema.hasColumn("articles", `${req.query.col}`) // true ou false
            if(isColumn)
                columnName = req.query.col            
        }
        
        // Se em ordem ascendente ou descendente.
        const ascdesc = req.query.asc === "0" ? "desc" : "asc"
        

        let page, entries, count // Variáveis pra definir o número da página e a quantidade de registros no banco de dados.

        // Quantos registros tem na tabela. Serve pra saber quantas páginas vamos gerar baseado na qtde de linhas da tabela.
        if(req.originalUrl.startsWith('/home')) { // QTDE de artigos do próprio usuário.
            entries = await app.db('articles').where({userId: req.user.id}).count('id').first()
        }
        else { // QTDE de artigos no total.
            entries = await app.db('articles').count('id').first()
        }
        count = entries.count // o número de registros.
        
        // Número da página. Se não tiver setado ou for inválido a página 1 é a padrão.
        page = 1
        if(parseInt(req.query.page) && parseInt(req.query.page) > 0 && parseInt(req.query.page) <= Math.ceil( (count / limit) ))
            page = parseInt(req.query.page)        
        

        // /HOME
        // O caminho a seguir é pra uso no /home do back e /perfil do front onde é pra retornar todos os artigos do req.user. paginado também.
        if(req.originalUrl.startsWith('/home')) {
            // A consulta paginada. Retornamos um objeto com os artigos sem a coluna content, nome da categoria, e as  variaveis 
            // count, limit e page. Essas variáveis são importantes no front pra montar a paginação.            
            app.db('articles')
                .join('categories', 'categories.id', 'articles.categoryId')
                .select('articles.id', 'title', 'description', "created_at", "updated_at", "published", app.db.raw("categories.name as categoryname") )
                .where("userId", req.user.id)
                .orderBy(columnName, ascdesc)
                .limit(limit).offset(page * limit - limit)
                .then(articles => {                    
                    res.json({ data: articles, count, limit, page })
                })                     
                .catch(err => res.status(500).send(err) )
        }
        
        // /ARTICLES
        // A consulta abaixo é pra uso no '/admin/articles' do front. Retorna registros paginados e na ordem da coluna desejada.        
        else {
            // A consulta paginada. Retornamos um objeto com os artigos sem a coluna content, nome do autor, nome da categoria, e as 
            // variaveis count, limit e page. Essas variáveis são importantes no front pra montar a paginação.            
            app.db('articles')
            .join('users', 'users.id', 'articles.userId')
            .join('categories', 'categories.id', 'articles.categoryId')
            .select('articles.id', 'title', "created_at", "updated_at", "published", app.db.raw("categories.name as categoryname"), app.db.raw("users.name as author"))            
            .orderBy(columnName, ascdesc)
            .limit(limit).offset(page * limit - limit)
            .then(articles => res.json({ data: articles, count, limit, page }))
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