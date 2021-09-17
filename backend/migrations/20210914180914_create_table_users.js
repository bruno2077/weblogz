// Essa migration cria a tabela de usuários.


exports.up = function(knex) {
    return knex.schema.createTable('users', table => {
        table.increments('id').primary();
        table.string('name').notNull();        
        table.string('email').notNull().unique();
        table.string('password').notNull();
        table.string('avatar', 1000); // link q aponta pra uma img no servidor.
        table.boolean('admin').notNull().defaultTo(false);
        table.timestamp('deletedAt');
    })
};

exports.down = function(knex) {
    return knex.schema.dropTable(users)
};