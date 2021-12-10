import Utils from "../../utils";
import BLManager from "./blManager";
import {
  apiFailureMessage,
  apiSuccessMessage,
  genericConstants,
  httpConstants,
} from "../../common/constants";

export default class UserController {
  async updateUser(request, response) {
    try {
      if (!request || !request.body || !request.body.userId)
        throw Utils.error(
          {},
          apiFailureMessage.INVALID_PARAMS,
          httpConstants.RESPONSE_CODES.FORBIDDEN
        );
      const [error, addUserResponse] = await Utils.parseResponse(
        new BLManager().updateUser(request.body)
      );
      if (error) {
        return Utils.handleError(error, request, response);
      }

      return Utils.response(
        response,
        addUserResponse,
        apiSuccessMessage.USER_UPDATE_SUCCESS,
        httpConstants.RESPONSE_STATUS.SUCCESS,
        httpConstants.RESPONSE_CODES.OK
      );
    } catch (error) {
      return Utils.handleError(error, request, response);
    }
  }
  
  async getUserByUserId(request, response) {
    try {
      if (!request || !request.body)
        throw Utils.error(
          {},
          apiFailureMessage.INVALID_PARAMS,
          httpConstants.RESPONSE_CODES.FORBIDDEN
        );
      const [error, addUserResponse] = await Utils.parseResponse(
        new BLManager().getUserByUserId(request.body)
      );
      if (error) {
        return Utils.handleError(error, request, response);
      }
      return Utils.response(
        response,
        addUserResponse,
        apiSuccessMessage.USER_GET_SUCCESS,
        httpConstants.RESPONSE_STATUS.SUCCESS,
        httpConstants.RESPONSE_CODES.OK
      );
    } catch (error) {
      return Utils.handleError(error, request, response);
    }
  }
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
