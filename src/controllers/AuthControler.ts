import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import db from '../database/connection';
import authConfig from '../config/auth.json';
import mailConfigs from '../config/mail';

interface IUser {
  id: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

interface IToken {
  is_revoked: boolean;
}

class AuthController {
  async create(request: Request, response: Response) {
    const { email, password } = request.body;

    const trx = await db.transaction();

    try {
      const user: IUser = await trx('users')
      .where('email', email)
      .select('*')
      .first()
      .returning('id');

      if(!user) {
        return response.status(404).send({ error: 'User not found'});
      }

      if(!await bcrypt.compare(password, user.password)) {
        return response.status(400).send({ error: 'Invalid Password'});
      }

      const user_id = user.id;

      const generatedToken = jwt.sign({id:user_id}, authConfig.secret, {
        expiresIn: 86400,
      });

      const existentToken = await trx('token')
        .where('user_id', user_id)
        .select('*')
        .first()
        .returning('id');

      if(existentToken) {
        await trx('token').where('user_id', user_id).delete();
      }

      const Accesstoken = await trx('token').insert({
        user_id,
        token: generatedToken,
        type: 'auth'
      }).returning('token');

      trx.commit();

      return response.json({ user, Accesstoken});
    } catch(err) {
      return response.status(400).send({ error: 'Token is wrong or has expired'});
    }
  }

  async forgotPassword(request: Request, response: Response) {
    const { email } = request.body;

    try {
      const user: IUser = await db('users')
        .where('email', email)
        .first()
        .returning('id');

      if(!user) {
        return response.status(404).json({ error: 'User not found'});
      }

      const generatedToken = jwt.sign({id:user.id}, authConfig.secret, {
        expiresIn: '1h',
      });

      await db('token').insert({
        user_id: user.id,
        token: generatedToken,
        type: 'recover'
      }).returning('token');

      const mailData = {
        to: {
          name: user.first_name + ' ' + user.last_name,
          email: user.email,
        },
        subject: 'Proffy recuperação de senha.',
        templateData: {
          variables: {
            name: user.first_name + ' ' + user.last_name,
            link: `${process.env.APP_WEB_URL}/reset_password`,
          },
        },
      };

      return response.send('ok');
      

    } catch(err) {
      return response.status(400).json({ error: 'ERROR'});
    }
  }

  async recoverPassword(request: Request, response: Response) {
    const { id } = request.params;
    const { password } = request.body;
    
    try{
      const user: IUser = await db('users')
        .where('id', id)
        .select('id')
        .first()
        .returning('id');

      if (!user) {
        return response.status(404).json({ error: 'User not found'});
      }

      const tokenType = 'recover';

      const providedToken: IToken = await db('token')
        .where('user_id', user.id)
        .where('type', tokenType)
        .select('*')
        .first()
        .returning('id');

      if(!providedToken) {
        return response.status(400).json({ error: 'No token provided'});
      }

      if(providedToken.is_revoked) {
        return response.status(400).json({ error: 'Your token haas expired' });
      }

      const hash = await bcrypt.hash(password, 10);

      await db('users').where('id', id)
        .update({
          password: hash,
        }).returning('id');

      response.status(200).json({ message: 'You password has been updated successfully' });

    } catch(err) {
      console.log(err);
      response.status(400).json({ error: 'Was not possible recover your passwrod'});
    }
  }
}

export default AuthController;