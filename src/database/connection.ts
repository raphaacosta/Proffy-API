import knex from 'knex';
import path from 'path';

const database = knex({
  /*client: 'sqlite3',
  connection: {
    filename: path.resolve(__dirname, 'database.sqlite')
  },
  useNullAsDefault: true,*/
  client: 'postgres',
  connection:{
    host: '127.0.0.1',
    user: 'postgres',
    password: 'rootroot',
    database: 'proffy',
  }
});

export default database;