import path from 'path';

module.exports = {
  client: 'postgres',
  connection:{
    host: '127.0.0.1',
    user: 'postgres',
    password: 'rootroot',
    database: 'proffy',
  },
  migrations: {
    directory: path.resolve(__dirname, 'src','database', 'migrations'),
  },
  pool: {
    min: 2,
    max: 10
  },
};