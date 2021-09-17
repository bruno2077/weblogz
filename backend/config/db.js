// Arquivo principal de configuração do banco de dados. Aqui importamos o knex e o arquivo de configuração knexfile.js, 
// e executamos as migrations.

const config = require('../knexfile.js')
const knex = require('knex')(config) // já passa executando com o arquivo de configuração.

// As migrations são executadas por aqui, a linha abaixo faz rodar no momento em q o servidor iniciar. 
knex.migrate.latest([config])

// manda pro index.js o knex já com a configuração do DB e as migrations executadas.
module.exports = knex