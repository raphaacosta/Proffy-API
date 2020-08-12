import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import authConfig from '../config/auth.json';
import db from '../database/connection';

export const auth = async (request: Request, response: Response, next: NextFunction) => {
  const authHeader = request.headers.authorization;

  if(!authHeader) {
    return response.status(401).json({ error: 'Token is required'});
  }

  const [ ,token] = authHeader.split(' ');

  try{
    jwt.verify(token, authConfig.secret, async (err) => {
      if(err) {
        await db('token').where('is_revoked', true).delete();

        return response.status(400).json({ error: 'Token has expired'});
      }
    });
    next();
  } catch(err) {
    console.log(err);
    return response.status(401).json({ error: 'Token malformatted' });
  }
}