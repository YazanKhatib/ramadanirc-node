import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .createTable('users', (table) => {
      table.increments('id').primary();
      table.string('username', 255).unique().notNullable();
      table.string('email', 255).unique().notNullable();
      table.string('password', 255).notNullable();
      table.boolean('admin').defaultTo(false);
      table.string('location', 255).nullable();
      table.integer('age', 3).nullable();
      table.string('gender', 255).nullable();
      table.string('refreshToken', 255).unique().notNullable();
      table.string('expirationDate').notNullable();
    })
    .createTable('tasks', (table) => {
      table.increments('id').primary();
      table.string('name', 255).unique().notNullable();
      table.boolean('fixed').defaultTo(false);
      table.timestamp('endDate').nullable();
      table.string('selectedIcon').nullable();
      table.string('notSelectedIcon').nullable();
    })
    .createTable('users_tasks', (table) => {
      table.integer('userId').references('id').inTable('users');
      table.integer('taskId').references('id').inTable('tasks');
      table.boolean('value').defaultTo(false);
      table.timestamp('createdAt').notNullable();
    })
    .createTable('prayers', (table) => {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.string('type').defaultTo('FARD');
    })
    .createTable('users_prayers', (table) => {
      table.integer('userId').references('id').inTable('users');
      table.integer('prayerId').references('id').inTable('prayers');
      table.integer('value').defaultTo(0);
      table.boolean('selected').defaultTo(false);
      table.timestamp('prayedAt').notNullable();
    })
    .createTable('quran_tracker', (table) => {
      table.increments('id').primary();
      table.integer('userId').references('id').inTable('users');
      table.integer('juz').defaultTo(1);
      table.integer('surah').defaultTo(1);
      table.integer('ayah').defaultTo(1);
    })
    .createTable('daily_quran', (table) => {
      table.increments('id').primary();
      table.integer('userId').references('id').inTable('users');
      table.boolean('value').defaultTo(false);
      table.timestamp('readAt').defaultTo(null);
    })
    .createTable('tidbits', (table) => {
      table.increments('id').primary();
      table.text('text').defaultTo('');
    })
    .createTable('favorites_tidbits', (table) => {
      table.integer('userId').references('id').inTable('users');
      table
        .integer('tidbitId')
        .references('id')
        .inTable('tidbits')
        .onDelete('CASCADE');
    })
    .createTable('duas', (table) => {
      table.increments('id').primary();
      table.text('textArabic').defaultTo('');
      table.text('textInbetween').defaultTo('');
      table.text('textEnglish').defaultTo('');
    })
    .createTable('favorites_duas', (table) => {
      table.integer('userId').references('id').inTable('users');
      table
        .integer('duaId')
        .references('id')
        .inTable('duas')
        .onDelete('CASCADE');
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema
    .dropTableIfExists('users_tasks')
    .dropTableIfExists('users_prayers')
    .dropTableIfExists('daily_quran')
    .dropTableIfExists('favorites_tidbits')
    .dropTableIfExists('quran_tracker')
    .dropTableIfExists('favorites_duas')
    .dropTableIfExists('duas')
    .dropTableIfExists('tidbits')
    .dropTableIfExists('prayers')
    .dropTableIfExists('tasks')
    .dropTableIfExists('users');
}
