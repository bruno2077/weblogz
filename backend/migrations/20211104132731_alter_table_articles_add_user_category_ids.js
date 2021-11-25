// Adiciona as colunas com ID do usuário que está criando o artigo e da categoria do artigo.

exports.up = function(knex) {
    return knex.schema.table('articles', table => {
        table.integer('userId').references('id').inTable('users').notNull() // O id do usuario que está associado a este artigo. 
        table.integer('categoryId').references('id').inTable('categories').notNull() // A categoria do artigo. Relaciona com a tabela categories.
    })
};

exports.down = function(knex) {
    return knex.schema.table('articles', table => {
        table.dropColumn('categoryId');
        table.dropColumn('userId');
    })
};
