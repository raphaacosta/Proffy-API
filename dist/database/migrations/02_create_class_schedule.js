"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.up = up;
exports.down = down;

async function up(knex) {
  return knex.schema.createTable('class_schedule', table => {
    table.increments('id').primary();
    table.integer('week_day').notNullable();
    table.integer('from').notNullable();
    table.integer('to').notNullable();
    table.integer('class_id').unsigned().notNullable().references('id').inTable('classes').onUpdate('CASCADE').onDelete('CASCADE');
  });
}

async function down(knex) {
  return knex.schema.dropTable('class_schedule');
}