// Update with your config settings.

module.exports = {
  development: {
    client: 'pg',
    connection: 'postgres://postgres:admin@localhost:5432/ramadanapp',
    migrations: {
      directory: './database/migrations',
    },
    seeds: {
      directory: './database/seeds',
    },
  },

  production: {
    client: 'postgresql',
    connection: {
      user: 'postgres',
      password: 'admin',
      database: 'ramadanapp',
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './database/migrations',
    },
    seeds: {
      directory: './database/seeds',
    },
  },
};
