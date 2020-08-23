"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_json_1 = __importDefault(require("../config/auth.json"));
const connection_1 = __importDefault(require("../database/connection"));
exports.auth = async (request, response, next) => {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
        return response.status(401).json({ error: 'Token is required' });
    }
    const [, token] = authHeader.split(' ');
    try {
        jsonwebtoken_1.default.verify(token, auth_json_1.default.secret, async (err) => {
            if (err) {
                await connection_1.default('token').where('is_revoked', true).delete();
                return response.status(400).json({ error: 'Token has expired' });
            }
        });
        next();
    }
    catch (err) {
        console.log(err);
        return response.status(401).json({ error: 'Token malformatted' });
    }
};
