import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('username', 255).unique().notNullable();
    table.string('email', 255).unique().notNullable();
    table.string('password', 255).notNullable();
    table.jsonb('location').nullable();
    table.integer('age', 3).nullable();
    table.string('gender', 255).nullable();
    table.string('refreshToken', 255).notNullable();
    table.string('expirationDate').notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('users');
}
