"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
async function up(knex) {
    return knex.schema.createTable('token', table => {
        table.increments('id').primary();
        table.integer('user_id')
            .unsigned()
            .notNullable()
            .references('id')
            .inTable('users')
            .onDelete('CASCADE')
            .onUpdate('CASCADE');
        table.string('token').notNullable().unique().index();
        table.string('type').notNullable();
        table.boolean('is_revoked').notNullable().defaultTo(false);
        table.timestamp('created_at')
            .defaultTo(knex.raw('CURRENT_TIMESTAMP'))
            .notNullable();
    });
}
exports.up = up;
async function down(knex) {
    return knex.schema.dropTable('token');
}
exports.down = down;
