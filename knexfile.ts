import path from 'path';
import 'dotenv/config';

module.exports = {
  client: 'pg',
  connection:{
    host: '127.0.0.1',
    user: 'postgres',
    password: 'rootroot',
    database: 'proffy',
  },
  migrations: {
    directory: path.resolve(__dirname, 'src','database', 'migrations'),
  },
  useNullAsDefault: true,
  /*client: 'pg',
  connection:{
    host: process.env.PG_HOST,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
  },
  migrations: {
    directory: path.resolve(__dirname, 'src','database', 'migrations'),
  },
  useNullAsDefault: true,*/
};