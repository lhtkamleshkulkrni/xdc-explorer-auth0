import Utils from "../../utils";
import AuthBLManager from "../auth0/manager";
import UserSchema from "../../models/user";

import {
  apiFailureMessage,
  httpConstants,
} from "../../common/constants";

export default class UserController {
  signUp = async (requestData) => {
    if (!requestData)
      throw Utils.handleError(
        {},
        apiFailureMessage.INVALID_PARAMS,
        httpConstants.RESPONSE_CODES.FORBIDDEN
      );

    try {
      let userDetail = await UserSchema.find({ email: requestData.email });

      if (userDetail && userDetail.length) {
        throw Utils.error(
          {},
          apiFailureMessage.USER_ALREADY_EXISTS,
          httpConstants.RESPONSE_CODES.FORBIDDEN
        );
      }

      const [error, addUserRes] = await Utils.parseResponse(
        new AuthBLManager().signUp(requestData)
      );

      requestData["userId"] = addUserRes.userId;

      console.log("data", requestData); 

      let userModel = new UserSchema(requestData);

      let userRes = await userModel.save()

      if (error)
        throw Utils.error(
          {},
          error.message || apiFailureMessage.USER_CREATE_AUTH0,
          httpConstants.RESPONSE_CODES.FORBIDDEN
        );

      return userRes;
    } catch (error) {
      throw error;
    }
  };
}
