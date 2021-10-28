// Altera o tipo de dado da coluna avatar pra binary.

exports.up = function(knex) {
    return knex.schema.alterTable('users', table => {
        table.binary('avatar').alter();        
    });   
}

exports.down = function(knex) {
    return knex.schema.alterTable('users', table => {
        table.string('avatar', 1000).alter();        
    }); 
};
