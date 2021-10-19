import Utils from "../../utils";
import BLManager from "./manager";
import {
  apiFailureMessage,
  apiSuccessMessage,
  httpConstants,
} from "../../common/constants";


export default class Index {
  async signUp(request, response) {
    try {
      lhtLog("Inside signup", "signup", request.body, 0, "");

      const [error, getRes] = await Utils.parseResponse(
        new BLManager().signUp(request.body)
      );

      if (!getRes) return Utils.handleError(error, request, response);
      return Utils.response(
        response,
        getRes,
        apiSuccessMessage.USER_CREATE_SUCCESS,
        httpConstants.RESPONSE_STATUS.SUCCESS,
        httpConstants.RESPONSE_CODES.OK
      );
    } catch (err) {
      Utils.response(
        response,

        {},
        err && err.message ? err.message : apiFailureMessage.SERVER_ERROR,
        httpConstants.RESPONSE_STATUS.FAILURE,
        err && err.code ? err.code : httpConstants.RESPONSE_CODES.NOT_FOUND
      );
    }
  }
}
