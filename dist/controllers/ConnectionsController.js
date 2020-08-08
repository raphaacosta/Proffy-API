"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _connection = _interopRequireDefault(require("../database/connection"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class ConnectionsController {
  async index(request, response) {
    const totalConnections = await (0, _connection.default)('connections').count('* as total');
    const {
      total
    } = totalConnections[0];
    return response.json({
      total
    });
  }

  async create(request, response) {
    const {
      user_id
    } = request.body;
    await (0, _connection.default)('connections').insert({
      user_id
    });
    return response.status(201).send();
  }

}

exports.default = ConnectionsController;