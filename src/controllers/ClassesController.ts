import {Request, Response} from 'express';
import db from "../database/connection";
import convertHourToMinute from "../utils/convertHourToMinutes";

interface ScheduleItem {
  id: number;
  week_day: number;
  from: string;
  to: string;
}

interface User{
  id: string;
  first_name: string;
  last_name: string;
  bio: string;
  avatar: string;
  password: string;
  email: string;
  whatsapp: string;
  access_type: string;
}

interface Token {
  id: number;
  user_id: number;
  token: string;
  is_revoked: boolean;
}

export default class ClassesController {
  async index(request: Request, response: Response) {
    const filters = request.query;

    const subject = filters.subject as string;
    const week_day = filters.week_day as string;
    const time = filters.time as string;

    if(!filters.week_day || !filters.subject || !filters.time) {
      return response.status(400).json({
        error: 'Missing filters to search classes'
      });
    }

    const timeInMinutes = convertHourToMinute(time);

    const classes = await db('classes')
      .whereExists(function() {
        this.select('class_schedule.*')
          .from('class_schedule')
          .whereRaw('class_schedule.class_id = classes.id')
          .whereRaw('class_schedule.week_day = ??', [Number(week_day)])
          .whereRaw('class_schedule.from <= ??', [timeInMinutes])
          .whereRaw('class_schedule.to > ??', [timeInMinutes])
      })
      .where('classes.subject', '=', subject)
      .join('users', 'classes.user_id', '=', 'users.id')
      .join('class_schedule', 'classes.id', '=', 'class_schedule.class_id')
      .select(['classes.*', 'users.*', 'class_schedule.*']);

    return response.json(classes);
  }
  
  async create(request:Request, response: Response) {
    const {
      id,
      whatsapp,
      bio,
      subject,
      cost,
      schedule
    } = request.body;
  
    const trx = await db.transaction();

    try{
      const token: Token = await trx('token')
        .where('user_id', id)
        .where('type', '=', 'auth')
        .select('is_revoked')
        .first()
        .returning('is_revoked');

      console.log(token.is_revoked+'\n')
      if(token.is_revoked) {
        return response.status(400).json({ error: 'You session has expired. Login again' });
      }
      
      const user: User = await trx('users')
        .where('id', id)
        .select('access_type')
        .first()
        .returning('id');

      if(user.access_type !== 'proffy') {
        return response.status(401).json({ error: 'You are not a Proffy, and do not have access to this page' });
      }

      const insertedUsersIds = await trx('users')
        .where('id', id)
        .update({
          whatsapp,
          bio,
        }).returning('id');
      
      const user_id = insertedUsersIds[0];
    
      const insertedClassesIds = await trx('classes').insert({
        subject,
        cost,
        user_id
      }).returning('id');
      
      const class_id = insertedClassesIds[0];
    
      const classSchedule = schedule.map((scheduleItem: ScheduleItem) => {
        return {
          class_id,
          week_day: scheduleItem.week_day,
          from: convertHourToMinute(scheduleItem.from),
          to: convertHourToMinute(scheduleItem.to),
        };
      });
    
      await trx('class_schedule').insert(classSchedule);
    
      await trx.commit();
    
      return response.status(201).send();
    } catch(err) {
      await trx.rollback();
      console.log(err);
      
      return response.status(400).json({
        error: 'Unexpected error while creating new class'
      });
    }
  }

  async update(request: Request, response: Response) {
    const token = request.headers.authorization;
    const { userId } = request.params;
    const { 
      avatar, 
      whatsapp, 
      bio, 
      id,
      subject,
      cost,
      schedule
    } = request.body;

    const trx = await db.transaction();

    try {
      const userInformations: User = await trx('users').where('id', userId).first().returning('id');
      
      const user_id = userInformations.id;
      const userAccess = userInformations.access_type;

      if(user_id != id || userAccess !== 'proffy') {
        return response.status(401).send({ error: 'Operation not permited'});
      }

      const authToken: Token = await trx('token')
        .where('user_id', user_id)
        .where('is_revoked', false)
        .where('type', '=', 'auth')
        .first()
        .returning('id');

      const registeredToken = authToken.token;
      const tokenValidation = authToken.is_revoked;
      
      if(tokenValidation) {
        return response.status(400).json({ error: 'Your token has expired'});
      }

      if(token !== 'Bearer '+registeredToken) {
        return response.status(401).json({ error: 'Operation not permited (TOKEN)'});
      }
            
      try {
        const insertedUsersIds = await trx('users')
          .where('id', userId)
          .update({
            avatar,
            whatsapp,
            bio
          }).returning('id');
        
        const user_id = insertedUsersIds[0];
      
        await trx('classes')
          .where('user_id', user_id)
          .update({
            cost,
          }).returning('id');
        
        /*const class_id = insertedClassesIds[0];

        const classSchedule = schedule.map((schedule_item: ScheduleItem) => {
          return {
            week_day: schedule_item.week_day,
            from: convertHourToMinute(schedule_item.from),
            to: convertHourToMinute(schedule_item.to),
          };
          
        });
        
        await trx('class_schedule')
          .where('id', classSchedule)
          .update(classSchedule); */

        trx.commit();

        return response.status(201).send();
      } catch(err) {
        trx.rollback();
        response.status(400).send({ error: 'Error while updating user informations'});
      }
    } catch(err) {
      return response.status(400).json({ error: 'Error updating profile'});
    }
  }
}