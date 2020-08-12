import knex from 'knex';
import 'dotenv/config';

const db = knex({
  client: 'pg',
  connection:{
    host: '127.0.0.1',
    user: 'postgres',
    password: 'rootroot',
    database: 'proffy',
  }
  /*client: 'pg',
  connection:{
    host: process.env.PG_HOST,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
  },
  useNullAsDefault: true,*/
});

export default db;