import { Request, Response } from 'express';
import bcrypt from 'bcrypt';

import db from '../database/connection';

class UsersController {
  async index() {};

  async create(request: Request, response: Response) {
    const { first_name, last_name, email, avatar, whatsapp, bio, password, access_type } = request.body;

    try {
      const hash = await bcrypt.hash(password, 10);

      const userEmailConfirmation = await db('users')
        .where('email', email)
        .select('id')
        .first()
        .returning('id');

      if(userEmailConfirmation) {
        return response.status(400).send({ error: 'User already exist'});
      }

      const user = await db('users').insert({
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
    } catch(err) {
      console.log(err);
      return response.status(400).send({ error: 'Error creating user'});
    }
  };
}

export default UsersController;