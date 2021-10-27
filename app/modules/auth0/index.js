import Utils from '../../utils'
import BlManager from "./manager";
import {apiSuccessMessage, httpConstants} from "../../common/constants";

export default class AuthenticationController{
  async signUp(request, response) {
    try {
      

      const [error, getRes] = await Utils.parseResponse(
        new BlManager().signUp(request.body)
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
    async signIn(request, response){
        const [error,data] = await Utils.parseResponse(new BlManager().signIn(request.body));
        if (error)
          return Utils.handleError(error,request,response);
        return Utils.response(response,data, httpConstants.RESPONSE_STATUS.SUCCESS, httpConstants.RESPONSE_CODES.OK);
      }

      async forgotPassword(request, response) {
        try {
            const [error, getRes] = await Utils.parseResponse(new BlManager().forgotPassword(request.body));
            if (!getRes) return Utils.handleError(error, request, response);
            return Utils.response(response, getRes, apiSuccessMessage.USER_PASSWORD_RESET_SUCCESS, httpConstants.RESPONSE_STATUS.SUCCESS, httpConstants.RESPONSE_CODES.OK);
        } catch (err) {
            Utils.response(response,
                {}, err && err.message ? err.message : apiFailureMessage.SERVER_ERROR, httpConstants.RESPONSE_STATUS.FAILURE, err && err.code ? err.code : httpConstants.RESPONSE_CODES.NOT_FOUND);
        }
    }
    async changeEmail(request, response) {
      try {
          const [error, getRes] = await Utils.parseResponse(new BlManager().changeEmail(request.body));
          if (!getRes) return Utils.handleError(error, request, response);
          return Utils.response(response, getRes, apiSuccessMessage.EMAIL_UPDATED_SUCCESS, httpConstants.RESPONSE_STATUS.SUCCESS, httpConstants.RESPONSE_CODES.OK);
      } catch (err) {
          Utils.response(response,
              {}, err && err.message ? err.message : apiFailureMessage.SERVER_ERROR, httpConstants.RESPONSE_STATUS.FAILURE, err && err.code ? err.code : httpConstants.RESPONSE_CODES.NOT_FOUND);
      }
  }
  async changePassword(request, response) {
    try {
        
        const [error, getRes] = await Utils.parseResponse(
            new BlManager().changePassword(request.body)
        );
        if (!getRes) return Utils.handleError(error, request, response);
        return Utils.response(response, getRes, apiSuccessMessage.EMAIL_UPDATED_SUCCESS, httpConstants.RESPONSE_STATUS.SUCCESS, httpConstants.RESPONSE_CODES.OK);
    } catch (err) {
        Utils.response(response,
            {}, err && err.message ? err.message : apiFailureMessage.SERVER_ERROR, httpConstants.RESPONSE_STATUS.FAILURE, err && err.code ? err.code : httpConstants.RESPONSE_CODES.NOT_FOUND);
    }
}

}
