import Knex from 'knex';

export async function up(knex: Knex) {
  return knex.schema.createTable('token', table => {
    table.increments('id').primary();
    table.integer('user_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')
      .onUpdate('CASCADE')
    table.string('token').notNullable().unique().index();
    table.string('type').notNullable();
    table.boolean('is_revoked').notNullable().defaultTo(false);
    table.timestamp('created_at')
      .defaultTo(knex.raw('CURRENT_TIMESTAMP'))
      .notNullable();
  })
}

export async function down(knex: Knex){
  return knex.schema.dropTable('token');
}