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
    app.post('/sign-in', new AuthenticationController().signIn);
    app.post("/forgot-password", new AuthenticationController().forgotPassword);
    app.get("/log-out/:userId", new AuthenticationController().logOut);
    app.post('/update-user', new UserController().updateUser);
    app.get('/user-info', new UserController().getUserByUserId);
    
    app.post("/change-password", new AuthenticationController().changePassword);
    
    app.post('/sign-up', new UserController().signUp);
    app.post('/add-user-cookies', ValidationManger.validateAddUserCookies, new UserController().addUserCookies);
    app.post('/get-user-cookies', new UserController().getUserCookies);
    app.post('/update-user-cookies', new UserController().updateUserCookies);

    /**
     * globalID APIs
     */

    app.post('/get-globalid-user-info', new UserController().getGlobalIdUserInfo);
};
