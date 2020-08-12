import express from 'express';

import ClassesController from './controllers/ClassesController';
import ConnectionsController from './controllers/ConnectionsController';
import UsersController from './controllers/UsersConttroller';
import AuthController from './controllers/AuthControler';
import { auth } from './middlewares/auth';

const routes = express.Router();
const classesControllers = new ClassesController;
const connectionsController = new ConnectionsController;
const usersController = new UsersController;
const authController = new AuthController;

routes.post('/users', usersController.create);

routes.post('/login', authController.create);
routes.put('/forgot_password', authController.forgotPassword);

routes.use(auth);

routes.post('/recover_password/:id', authController.recoverPassword);

routes.get('/classes', classesControllers.index);
routes.post('/classes', classesControllers.create);
routes.put('/classes/:userId', classesControllers.update);

routes.post('/connections', connectionsController.create);
routes.get('/connections', connectionsController.index);

export default routes;