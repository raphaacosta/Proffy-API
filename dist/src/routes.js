"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ClassesController_1 = __importDefault(require("./controllers/ClassesController"));
const ConnectionsController_1 = __importDefault(require("./controllers/ConnectionsController"));
const UsersConttroller_1 = __importDefault(require("./controllers/UsersConttroller"));
const AuthControler_1 = __importDefault(require("./controllers/AuthControler"));
const auth_1 = require("./middlewares/auth");
const routes = express_1.default.Router();
const classesControllers = new ClassesController_1.default;
const connectionsController = new ConnectionsController_1.default;
const usersController = new UsersConttroller_1.default;
const authController = new AuthControler_1.default;
routes.post('/users', usersController.create);
routes.post('/login', authController.create);
routes.put('/forgot_password', authController.forgotPassword);
routes.use(auth_1.auth);
routes.post('/recover_password/:id', authController.recoverPassword);
routes.get('/classes', classesControllers.index);
routes.post('/classes', classesControllers.create);
routes.put('/classes/:userId', classesControllers.update);
routes.post('/connections', connectionsController.create);
routes.get('/connections', connectionsController.index);
exports.default = routes;
