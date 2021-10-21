/**
 * Created by AyushK on 18/09/20.
 */
import * as ValidationManger from "../middleware/validation";
import TestModule from "../app/modules/testModule";
import {stringConstants} from "../app/common/constants";
import UserController from '../app/modules/user/index';


import AuthenticationController from '../app/modules/auth0/AuthenticationController'

module.exports = (app) => {
    app.get('/', (req, res) => res.send(stringConstants.SERVICE_STATUS_HTML));

    /**
     * route definition
     */
    app.get("/test-route", ValidationManger.validateUserLogin, new TestModule().testRoute);
    app.post('/sign-up', ValidationManger.validateSignUp, new UserController().signUp);
    app.post('/login',ValidationManger.validateUserLogin, new AuthenticationController().signIn);
};
