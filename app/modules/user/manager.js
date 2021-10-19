import Utils from "../../utils";
import AuthBLManager from "../auth0/manager";
import UserSchema from "../../models/user"


import {
  apiFailureMessage,
  apiSuccessMessage,
  genericConstants,
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

      let userModel = new UserSchema(requestData);

      let resObj = await userModel.save();

      // let userRes = await resObj.save();

      // requestData["user_id"] = userRes.userId;

      const [error, addUserRes] = await Utils.parseResponse(
        new AuthBLManager().signUp(requestData)
      );

      if (error)
        throw Utils.error(
          {},
          error.message || apiFailureMessage.USER_CREATE_AUTH0,
          httpConstants.RESPONSE_CODES.FORBIDDEN
        );

      return addUserRes;
    } catch (error) {
      throw error;
    }
  };
}
