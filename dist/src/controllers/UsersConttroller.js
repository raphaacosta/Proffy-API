"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const connection_1 = __importDefault(require("../database/connection"));
class UsersController {
    async index() { }
    ;
    async create(request, response) {
        const { first_name, last_name, email, avatar, whatsapp, bio, password, access_type } = request.body;
        try {
            const hash = await bcrypt_1.default.hash(password, 10);
            const userEmailConfirmation = await connection_1.default('users')
                .where('email', email)
                .select('id')
                .first()
                .returning('id');
            if (userEmailConfirmation) {
                return response.status(400).send({ error: 'User already exist' });
            }
            const user = await connection_1.default('users').insert({
                first_name,
                last_name,
                email,
                avatar: '',
                whatsapp: '',
                bio: '',
                password: hash,
                access_type,
            }).returning('*');
            return response.json(user);
        }
        catch (err) {
            console.log(err);
            return response.status(400).send({ error: 'Error creating user' });
        }
    }
    ;
}
exports.default = UsersController;
