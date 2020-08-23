"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
require("dotenv/config");
module.exports = {
    client: 'pg',
    connection: {
        host: '127.0.0.1',
        user: 'postgres',
        password: 'rootroot',
        database: 'proffy',
    },
    migrations: {
        directory: path_1.default.resolve(__dirname, 'src', 'database', 'migrations'),
    },
    useNullAsDefault: true,
};
