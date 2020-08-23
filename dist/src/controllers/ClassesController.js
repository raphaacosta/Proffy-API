"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const connection_1 = __importDefault(require("../database/connection"));
const convertHourToMinutes_1 = __importDefault(require("../utils/convertHourToMinutes"));
class ClassesController {
    async index(request, response) {
        const filters = request.query;
        const { page = 1 } = request.query;
        const subject = filters.subject;
        const week_day = filters.week_day;
        const time = filters.time;
        if (!filters.week_day || !filters.subject || !filters.time) {
            return response.status(400).json({
                error: 'Missing filters to search classes'
            });
        }
        const timeInMinutes = convertHourToMinutes_1.default(time);
        const [count] = await connection_1.default('users')
            .where('access_type', '=', 'proffy')
            .count();
        const classes = await connection_1.default('classes')
            .whereExists(function () {
            this.select('class_schedule.*')
                .from('class_schedule')
                .whereRaw('class_schedule.class_id = classes.id')
                .whereRaw('class_schedule.week_day = ??', [Number(week_day)])
                .whereRaw('class_schedule.from <= ??', [timeInMinutes])
                .whereRaw('class_schedule.to > ??', [timeInMinutes]);
        })
            .where('classes.subject', '=', subject)
            .join('users', 'classes.user_id', '=', 'users.id')
            .join('class_schedule', 'classes.id', '=', 'class_schedule.class_id')
            .limit(5)
            .offset((Number(page) - 1) * 5)
            .select(['classes.*', 'users.*', 'class_schedule.*']);
        response.header('X-Total-Count', count['count']);
        return response.json(classes);
    }
    async create(request, response) {
        const { id, whatsapp, bio, subject, cost, schedule } = request.body;
        const trx = await connection_1.default.transaction();
        try {
            const token = await trx('token')
                .where('user_id', id)
                .where('type', '=', 'auth')
                .select('is_revoked')
                .first()
                .returning('is_revoked');
            // console.log(token.is_revoked+'\n')
            if (token.is_revoked) {
                return response.status(400).json({ error: 'You session has expired. Login again' });
            }
            const user = await trx('users')
                .where('id', id)
                .select('access_type')
                .first()
                .returning('id');
            if (user.access_type !== 'proffy') {
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
            const classSchedule = schedule.map((scheduleItem) => {
                return {
                    class_id,
                    week_day: scheduleItem.week_day,
                    from: convertHourToMinutes_1.default(scheduleItem.from),
                    to: convertHourToMinutes_1.default(scheduleItem.to),
                };
            });
            await trx('class_schedule').insert(classSchedule);
            await trx.commit();
            return response.status(201).send();
        }
        catch (err) {
            await trx.rollback();
            // console.log(err);
            return response.status(400).json({
                error: 'Unexpected error while creating new class'
            });
        }
    }
    async update(request, response) {
        const token = request.headers.authorization;
        const { userId } = request.params;
        const { avatar, whatsapp, bio, id, subject, cost, schedule } = request.body;
        const trx = await connection_1.default.transaction();
        try {
            const userInformations = await trx('users').where('id', userId).first().returning('id');
            const user_id = userInformations.id;
            const userAccess = userInformations.access_type;
            if (user_id != id || userAccess !== 'proffy') {
                return response.status(401).send({ error: 'Operation not permited' });
            }
            const authToken = await trx('token')
                .where('user_id', user_id)
                .where('is_revoked', false)
                .where('type', '=', 'auth')
                .first()
                .returning('id');
            const registeredToken = authToken.token;
            const tokenValidation = authToken.is_revoked;
            if (tokenValidation) {
                return response.status(400).json({ error: 'Your token has expired' });
            }
            if (token !== 'Bearer ' + registeredToken) {
                return response.status(401).json({ error: 'Operation not permited (TOKEN)' });
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
                // const class_id = insertedClassesIds[0];
                // const classSchedule = schedule.map((schedule_item: ScheduleItem) => {
                //   return {
                //     week_day: schedule_item.week_day,
                //     from: convertHourToMinute(schedule_item.from),
                //     to: convertHourToMinute(schedule_item.to),
                //   };
                // });
                // console.log(classSchedule['week_day']);
                // await trx('class_schedule')
                //   .where('id', classSchedule)
                //   .update(classSchedule);
                trx.commit();
                return response.status(201).send();
            }
            catch (err) {
                trx.rollback();
                response.status(400).send({ error: 'Error while updating user informations' });
            }
        }
        catch (err) {
            return response.status(400).json({ error: 'Error updating profile' });
        }
    }
}
exports.default = ClassesController;
