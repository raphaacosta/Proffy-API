"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _ClassesController = _interopRequireDefault(require("./controllers/ClassesController"));

var _ConnectionsController = _interopRequireDefault(require("./controllers/ConnectionsController"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const routes = _express.default.Router();

const classesControllers = new _ClassesController.default();
const connectionsController = new _ConnectionsController.default();
routes.post('/classes', classesControllers.create);
routes.get('/classes', classesControllers.index);
routes.post('/connections', connectionsController.create);
routes.get('/connections', connectionsController.index);
var _default = routes;
exports.default = _default;