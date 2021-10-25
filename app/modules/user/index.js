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
            throw Utils.error({}, apiFailureMessage.INVALID_PARAMS, httpConstants.RESPONSE_CODES.FORBIDDEN);
          const [error, addUserResponse] = await Utils.parseResponse(new BLManager().updateUser(request.body));
          if (error) {
            return Utils.handleError(error, request, response);
          }
    
          return Utils.response(response, addUserResponse, apiSuccessMessage.USER_UPDATE_SUCCESS, httpConstants.RESPONSE_STATUS.SUCCESS, httpConstants.RESPONSE_CODES.OK)
        } catch (error) {
          return Utils.handleError(error, request, response);
        }
      }
      async changeEmail(request, response) {
        try {
          if (!request || !request.body || !request.body.userId)
            throw Utils.error({}, apiFailureMessage.INVALID_REQUEST, httpConstants.RESPONSE_CODES.FORBIDDEN);
          const [error, changeEmailResponse] = await Utils.parseResponse(new BLManager().changeEmail(request.body));
          if (error) {
            return Utils.handleError(error, request, response);
          }
          return Utils.response(response, changeEmailResponse, apiSuccessMessage.EMAIL_UPDATED_SUCCESS, httpConstants.RESPONSE_STATUS.SUCCESS, httpConstants.RESPONSE_CODES.OK);
        } catch (error) {
          return Utils.handleError(error, request, response);
        }
      }
    }
