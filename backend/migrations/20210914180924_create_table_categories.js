// Essa migration cria a tabela de categorias dos artigos. Uma categoria será uma subcategoria se tiver um parentId.


exports.up = function(knex) {
    return knex.schema.createTable('categories', table => {
        table.increments('id').primary();
        table.string('name').notNull();
        table.integer('parentId').references('id').inTable('categories')
    })
};

exports.down = function(knex) {
    return knex.schema.dropTable('categories')
};