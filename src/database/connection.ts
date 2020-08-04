import knex from 'knex';
import path from 'path';

const db = knex({
  /*client: 'postgres',
  connection:{
    host: '127.0.0.1',
    user: 'postgres',
    password: 'rootroot',
    database: 'proffy',
  }*/
  client: 'sqlite3',
  connection: {
    filename: path.resolve(__dirname, 'database.sqlite')
  },
  useNullAsDefault: true,
  /*client: 'mysql',
  connection: {
    host: '127.0.0.1',
    user: 'root',
    password: 'rootroot',
    database: 'proffy'
  }*/
});

export default db;