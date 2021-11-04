// Essa migration remove a coluna parentId da tabela categories. Cada categoria passa a ser independente. Não existirá sub-categorias.

exports.up = function(knex) {
    // ALTER TABLE categories DROP COLUMN parentId;
    return knex.schema.table('categories', table => {
        table.dropColumn('parentId');
    })
};

exports.down = function(knex) {
    return knex.schema.table('categories', table => {
        table.integer('parentId').references('id').inTable('categories')
    })
};
