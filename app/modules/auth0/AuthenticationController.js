import Utils from "../../utils";
import BLManager from "./manager";
import {
  apiFailureMessage,
  apiSuccessMessage,
  httpConstants,
} from "../../common/constants";
import BlManager from "./manager";

export default class AuthenticationController {
    async signIn(request, response) {
      const [error, data] = await Utils.parseResponse(
        new BlManager().signIn(request.body)
      );
      if (error) return Utils.handleError(error, request, response);
      return Utils.response(
        response,
        data,
        apiSuccessMessage.LOGIN_SUCCESS,
        httpConstants.RESPONSE_STATUS.SUCCESS,
        httpConstants.RESPONSE_CODES.OK
      );
    }
  }