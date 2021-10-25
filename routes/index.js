/**
 * Created by AyushK on 18/09/20.
 */
import * as ValidationManger from "../middleware/validation";
import TestModule from "../app/modules/testModule";
import {stringConstants} from "../app/common/constants";
import AuthenticationController from '../app/modules/auth0/index'
import UserController from '../app/modules/user/index';

module.exports = (app) => {
    app.get('/', (req, res) => res.send(stringConstants.SERVICE_STATUS_HTML));

    /**
     * route definition
     */
    app.post('/sign-in',ValidationManger.validateUserLogin, new AuthenticationController().signIn);
    app.post("/forgot-password",ValidationManger.validateEmail, new AuthenticationController().forgotPassword);
    app.post('/update-user', new UserController().updateUser);
    app.post("/changeEmail", new AuthenticationController().changeEmail);
    app.post("/change-password", new AuthenticationController().changePassword);
};
