"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _connection = _interopRequireDefault(require("../database/connection"));

var _convertHourToMinutes = _interopRequireDefault(require("../utils/convertHourToMinutes"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class ClassesController {
  async index(request, response) {
    const filters = request.query;
    const subject = filters.subject;
    const week_day = filters.week_day;
    const time = filters.time;

    if (!filters.week_day || !filters.subject || !filters.time) {
      return response.status(400).json({
        error: 'Missing filters to search classes'
      });
    }

    const timeInMinutes = (0, _convertHourToMinutes.default)(time);
    const classes = await (0, _connection.default)('classes').whereExists(function () {
      this.select('class_schedule.*').from('class_schedule').whereRaw('class_schedule.class_id = classes.id').whereRaw('class_schedule.week_day = ??', [Number(week_day)]).whereRaw('class_schedule.from <= ??', [timeInMinutes]).whereRaw('class_schedule.to > ??', [timeInMinutes]);
    }).where('classes.subject', '=', subject).join('users', 'classes.user_id', '=', 'users.id').select(['classes.*', 'users.*']);
    return response.json(classes);
  }

  async create(request, response) {
    const {
      name,
      avatar,
      whatsapp,
      bio,
      subject,
      cost,
      schedule
    } = request.body;
    const trx = await _connection.default.transaction();

    try {
      const insertedUsersIds = await trx('users').insert({
        name,
        avatar,
        whatsapp,
        bio
      }).returning('id');
      const user_id = insertedUsersIds[0];
      const insertedClassesIds = await trx('classes').insert({
        subject,
        cost,
        user_id
      }).returning('id');
      const class_id = insertedClassesIds[0];
      const classSchedule = schedule.map(scheduleItem => {
        return {
          class_id,
          week_day: scheduleItem.week_day,
          from: (0, _convertHourToMinutes.default)(scheduleItem.from),
          to: (0, _convertHourToMinutes.default)(scheduleItem.to)
        };
      });
      await trx('class_schedule').insert(classSchedule);
      await trx.commit();
      return response.status(201).send();
    } catch (err) {
      await trx.rollback();
      console.log(err);
      return response.status(400).json({
        error: 'Unexpected error while creating new class'
      });
    }
  }

}

exports.default = ClassesController;