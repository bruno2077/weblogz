// Essa migration cria a tabela de artigos.


exports.up = function(knex) {
    return knex.schema.createTable('articles', table => {
        table.increments('id').primary();
        table.timestamps(); // cria 2 colunas: created_at e updated_at
        table.string('title').notNull();
        table.string('description', 1000).notNull();        
        table.binary('content').notNull();
        table.boolean('published').notNull().defaultTo(true);
    })
};

exports.down = function(knex) {
    return knex.schema.dropTable('articles')
};