import Utils from "../../utils";
import BLManager from "./manager";
import {
  apiFailureMessage,
  apiSuccessMessage,
  genericConstants,
  httpConstants,
} from "../../common/constants";


export default class UserController {
  async signUp(request, response) {
    try {
      if (!request || !request.body)
        throw Utils.handleError(
          {},
          apiFailureMessage.INVALID_PARAMS,
          httpConstants.RESPONSE_CODES.FORBIDDEN
        );

      const [error, addUserResponse] = await Utils.parseResponse(
        new BLManager().signUp(request.body)
      );

      if (error) {
        return Utils.handleError(error, request, response);
      }

      return Utils.response(
        response,
        addUserResponse,
        apiSuccessMessage.USER_ADD_SUCCESS,
        httpConstants.RESPONSE_STATUS.SUCCESS,
        httpConstants.RESPONSE_CODES.OK
      );
    } catch (error) {
      throw Utils.handleError(error, request, response);
    }
  }
}
