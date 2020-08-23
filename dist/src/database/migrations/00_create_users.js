"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
async function up(knex) {
    return knex.schema.createTable('users', table => {
        table.increments('id').primary();
        table.string('first_name').notNullable();
        table.string('last_name').notNullable();
        table.string('email').unique().notNullable();
        table.string('password').notNullable();
        table.string('avatar').notNullable();
        table.string('access_type').notNullable();
        table.string('whatsapp').notNullable();
        table.string('bio').notNullable();
    });
}
exports.up = up;
async function down(knex) {
    return knex.schema.dropTable('users');
}
exports.down = down;
