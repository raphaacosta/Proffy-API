"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const connection_1 = __importDefault(require("../database/connection"));
const auth_json_1 = __importDefault(require("../config/auth.json"));
const mail_1 = __importDefault(require("../config/mail"));
class AuthController {
    async create(request, response) {
        const { email, password } = request.body;
        const trx = await connection_1.default.transaction();
        try {
            const user = await trx('users')
                .where('email', email)
                .select('*')
                .first()
                .returning('id');
            if (!user) {
                return response.status(404).send({ error: 'User not found' });
            }
            if (!await bcrypt_1.default.compare(password, user.password)) {
                return response.status(400).send({ error: 'Invalid Password' });
            }
            const user_id = user.id;
            const generatedToken = jsonwebtoken_1.default.sign({ id: user_id }, auth_json_1.default.secret, {
                expiresIn: 86400,
            });
            const existentToken = await trx('token')
                .where('user_id', user_id)
                .select('*')
                .first()
                .returning('id');
            if (existentToken) {
                await trx('token').where('user_id', user_id).delete();
            }
            const Accesstoken = await trx('token').insert({
                user_id,
                token: generatedToken,
                type: 'auth'
            }).returning('token');
            trx.commit();
            return response.json({ user, Accesstoken });
        }
        catch (err) {
            return response.status(400).send({ error: 'Token is wrong or has expired' });
        }
    }
    async forgotPassword(request, response) {
        const { email } = request.body;
        try {
            const user = await connection_1.default('users')
                .where('email', email)
                .first()
                .returning('id');
            if (!user) {
                return response.status(404).json({ error: 'User not found' });
            }
            const generatedToken = jsonwebtoken_1.default.sign({ id: user.id }, auth_json_1.default.secret, {
                expiresIn: '1h',
            });
            const token = await connection_1.default('token').insert({
                user_id: user.id,
                token: generatedToken,
                type: 'recover'
            }).returning('token');
            mail_1.default.to = user.email;
            mail_1.default.subject = 'Recuperação de senha';
            mail_1.default.message = `Use esse token para recuperar sua senha ${token}`;
            let result = mail_1.default.sendMail();
            return response.json({ 'result': result });
        }
        catch (err) {
            return response.status(400).json({ error: 'ERROR' });
        }
    }
    async recoverPassword(request, response) {
        const { id } = request.params;
        const { password } = request.body;
        try {
            const user = await connection_1.default('users')
                .where('id', id)
                .select('id')
                .first()
                .returning('id');
            if (!user) {
                return response.status(404).json({ error: 'User not found' });
            }
            const tokenType = 'recover';
            const providedToken = await connection_1.default('token')
                .where('user_id', user.id)
                .where('type', tokenType)
                .select('*')
                .first()
                .returning('id');
            if (!providedToken) {
                return response.status(400).json({ error: 'No token provided' });
            }
            if (providedToken.is_revoked) {
                return response.status(400).json({ error: 'Your token haas expired' });
            }
            const hash = await bcrypt_1.default.hash(password, 10);
            await connection_1.default('users').where('id', id)
                .update({
                password: hash,
            }).returning('id');
            response.status(200).json({ message: 'You password has been updated successfully' });
        }
        catch (err) {
            console.log(err);
            response.status(400).json({ error: 'Was not possible recover your passwrod' });
        }
    }
}
exports.default = AuthController;
