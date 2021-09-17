// Update with your config settings.

module.exports = {
  client: 'postgresql',
  connection: {
    database: 'weblogz',
    user:     'postgres',
    password: '12345678'
  },
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    tableName: 'knex_migrations'
  }
};