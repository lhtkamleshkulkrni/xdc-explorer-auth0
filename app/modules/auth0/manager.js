import { apiFailureMessage, httpConstants } from "../../common/constants";
import HttpService from "../../service/http-service";
import Config from "../../../config/index";
import UserModel from "../../models/user";
import User from "../user/blManager";
import Utils from "../../utils";
import BlManager from "./index";

export default class Manager {
  async getAccessTokenSignIn(email, password) {
    const data = {
      grant_type: "password",
      username: email,
      password: password,
      domain: Config.AUTH0_DOMAIN,
      client_id: Config.AUTH0_CLIENT_ID,
      client_secret: Config.AUTH0_CLIENT_SECRET,
      audience: Config.AUTH0_MANAGEMENT_BASEURL,
      redirectUri: "",
      scope: Config.AUTH0_SCOPE,
      responseType: Config.AUTH0_RESPONSE_TYPE,
    };

    const headers = {
      "Content-Type": httpConstants.HEADER_TYPE.APPLICATION_JSON,
    };
    const accessTokenResponse = await HttpService.executeHTTPRequest(
      httpConstants.METHOD_TYPE.POST,
      Config.AUTH0_DOMAIN,
      "oauth/token",
      data,
      headers
    ).catch((err) => {
      throw err;
    });
    

    if (
      accessTokenResponse &&
      (accessTokenResponse.error || accessTokenResponse.error_description)
    )
    throw Utils.error({}, accessTokenResponse.error_description || apiFailureMessage.INVALID_PARAMS,
      httpConstants.RESPONSE_CODES.FORBIDDEN);
    return accessTokenResponse.access_token;
  }

  getAccessToken = async () => {
    const data = {
      grant_type: "client_credentials",
      client_id: Config.AUTH0_CLIENT_ID,
      client_secret: Config.AUTH0_CLIENT_SECRET,
      audience: Config.AUTH0_MANAGEMENT_BASEURL,
    };

    const headers = {
      "Content-Type": httpConstants.HEADER_TYPE.APPLICATION_JSON,
    };
    const accessTokenResponse = await HttpService.executeHTTPRequest(
      httpConstants.METHOD_TYPE.POST,
      Config.AUTH0_DOMAIN,
      "oauth/token",
      data,
      headers
    ).catch((err) => {
      throw err;
    });
    
console.log(accessTokenResponse)
    if (
      accessTokenResponse &&
      (accessTokenResponse.error || accessTokenResponse.error_description)
    )
    throw Utils.error({}, accessTokenResponse.error_description || apiFailureMessage.INVALID_PARAMS,
      httpConstants.RESPONSE_CODES.FORBIDDEN);
    return accessTokenResponse.access_token;
  };

  getManagementAccessToken = async () => {
    const data = {
      grant_type: "client_credentials",
      client_id: Config.AUTH0_MANAGEMENT_API_CLIENT_ID,
      client_secret: Config.AUTH0_MANAGEMENT_API_SECRET,
      audience: Config.AUTH0_MANAGEMENT_BASEURL,
    };

    const headers = {
      "Content-Type": httpConstants.HEADER_TYPE.APPLICATION_JSON,
    };
    const accessTokenResponse = await HttpService.executeHTTPRequest(
      httpConstants.METHOD_TYPE.POST,
      Config.AUTH0_DOMAIN,
      "oauth/token",
      data,
      headers
    ).catch((err) => {
      throw err;
    });
    

    if (
      accessTokenResponse &&
      (accessTokenResponse.error || accessTokenResponse.error_description)
    )
    throw Utils.error({}, accessTokenResponse.error_description || apiFailureMessage.INVALID_PARAMS,
      httpConstants.RESPONSE_CODES.FORBIDDEN);
    return accessTokenResponse.access_token;
  };

  async signIn(request) {
    if(!request || !request.email || !request.password)
        throw {message:"email and password are required"}
    const accessToken = await this.getAccessTokenSignIn(request.email, request.password).catch(err => {
        throw err
    });
   
    const headers = {
        "Content-Type": httpConstants.HEADER_TYPE.APPLICATION_JSON,
        Authorization: `Bearer ${accessToken}`
    }
    const userInfoRes = await HttpService.executeHTTPRequest(httpConstants.METHOD_TYPE.POST, Config.AUTH0_DOMAIN, "userinfo", {}, headers)
    .catch(err => {
        throw err;
    });
    console.log("responsee",userInfoRes)
    
    const newReturnObject = {
  userInfoRes,
      
accessToken,
      
      }         
      return newReturnObject
    
}

  logIn = async (email, password) => {
    const data = {
      grant_type: "password",
      username: email,
      password: password,
      domain: Config.AUTH0_DOMAIN,
      client_id: Config.AUTH0_CLIENT_ID,
      client_secret: Config.AUTH0_CLIENT_SECRET,
      audience: Config.AUTH0_MANAGEMENT_BASEURL,
      redirectUri: "",
      scope: Config.AUTH0_SCOPE,
      responseType: Config.AUTH0_RESPONSE_TYPE,
    };
    // const headers = { "content-type": "application/json" };
    // let accessTokenResponse = await HttpService.executeHTTPRequest(httpConstants.METHOD_TYPE.POST, Config.AUTH0_DOMAIN, 'oauth/token', token_body, headers);

    const headers = {
      "Content-Type": httpConstants.HEADER_TYPE.APPLICATION_JSON,
    };
    const accessTokenResponse = await HttpService.executeHTTPRequest(
      httpConstants.METHOD_TYPE.POST,
      Config.AUTH0_DOMAIN,
      "oauth/token",
      data,
      headers
    ).catch((err) => {
      throw err;
    });
    if (
      accessTokenResponse &&
      (accessTokenResponse.error || accessTokenResponse.error_description)
    )
      throw Utils.error(
        {},
        accessTokenResponse.error_description ||
          apiFailureMessage.INVALID_PARAMS,
        httpConstants.RESPONSE_CODES.FORBIDDEN
      );

    return accessTokenResponse;
  };

  updateUser = async (request) => {
    let accessToken = await this.getManagementAccessToken();
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
    };

    let userId = request.userId;
    delete request.userId;
    let updateRes = await HttpService.executeHTTPRequest(
      httpConstants.METHOD_TYPE.PATCH,
      Config.AUTH0_DOMAIN,
      `api/v2/users/${userId}`,
      request,
      headers
    );

    if (!updateRes || updateRes.error)
      throw Utils.error(
        [],
        updateRes.message ? updateRes.message : apiFailureMessage.UPDATE_USER,
        httpConstants.RESPONSE_CODES.FORBIDDEN
      );
    return updateRes;
  };

  forgotPassword = async (requestData) => {
    try {
        if (!requestData || Object.keys(requestData).length < 1 || !requestData.email)
            throw apiFailureMessage.INVALID_PARAMS;

        let user = await UserModel.findOne({ email: requestData.email })
        if (!user) {
            throw apiFailureMessage.USER_NOT_EXISTS
        }
        const headers = { "content-type": "application/json" };
        let requestObj = {
            "client_id": Config.AUTH0_MANAGEMENT_API_CLIENT_ID,
            "connection": Config.AUTH0_CONNECTION,
            "email": requestData.email,
        }

        let forgotPassResponse = await HttpService.executeHTTPRequest(httpConstants.METHOD_TYPE.POST, Config.AUTH0_DOMAIN, `dbconnections/change_password`, requestObj, headers);
       

        if (forgotPassResponse && forgotPassResponse.error || forgotPassResponse.statusCode)
            throw Utils.error({}, forgotPassResponse.error || apiFailureMessage.RESET_PASSWORD_AUTH0, httpConstants.RESPONSE_CODES.FORBIDDEN);

        return { message: forgotPassResponse };
    } catch (error) {
        throw error
    }
};
  signUp = async (requestData) => {
    try {
      if (
        !requestData ||
        Object.keys(requestData).length < 1 ||
        !requestData.email ||
        !requestData.password
      )
        throw Utils.error(
          [],
          apiFailureMessage.INVALID_PARAMS,
          httpConstants.RESPONSE_CODES.FORBIDDEN
        );

      let requestObj = {
        connection: Config.AUTH0_CONNECTION,
        email: requestData.email,
        password: requestData.password,
      };

      let accessToken = await this.getAccessToken();
      const headers = {
        Authorization: `Bearer ${accessToken}`,

        "content-type": "application/json",
      };

      let signupResponse = await HttpService.executeHTTPRequest(
        httpConstants.METHOD_TYPE.POST,
        Config.AUTH0_DOMAIN,
        `api/v2/users`,
        requestObj,
        headers
      );

      

      if ((signupResponse && signupResponse.error) || signupResponse.statusCode)
        throw signupResponse.message || apiFailureMessage.USER_CREATE_AUTH0;

      requestData["userId"] = signupResponse.user_id;

      return requestData;
    } catch (error) {
      throw error;
    }
  };

  changePassword = async (requestData) => {
    try {
      if (
        !requestData ||
        Object.keys(requestData).length < 1 ||
        !requestData.userId ||
        !requestData.newPassword ||
        !requestData.oldPassword
      )
        throw apiFailureMessage.INVALID_PARAMS;

      let userDetails = await UserModel.findOne({ userId: requestData.userId });
      if (!userDetails) {
        throw apiFailureMessage.USER_NOT_EXISTS;
      }
      try {
        await this.logIn(userDetails.email, requestData.oldPassword);
        // await Utils.parseResponse(new BlManager().signIn(userDetails.email, requestData.oldPassword) );
      } catch (error) {
        throw `You have entered wrong old password`;
      }

      let accessToken = await this.getManagementAccessToken();
      const headers = {
        Authorization: `Bearer ${accessToken}`,
        "content-type": "application/json",
      };

      let requestObj = {
        connection: Config.AUTH0_CONNECTION,
        password: requestData.newPassword,
      };

      let resetPassResponse = await HttpService.executeHTTPRequest(
        httpConstants.METHOD_TYPE.PATCH,
        Config.AUTH0_DOMAIN,
        `api/v2/users/${userDetails.userId}`,
        requestObj,
        headers
      );
      

      if (
        (resetPassResponse && resetPassResponse.error) ||
        resetPassResponse.statusCode
      )
        throw Utils.error(
          {},
          resetPassResponse.error || apiFailureMessage.RESET_PASSWORD_AUTH0,
          httpConstants.RESPONSE_CODES.FORBIDDEN
        );
     
      return resetPassResponse;
    } catch (error) {
      throw error;
    }
  };
  logOut = async (requestData) => {
    try {
      if (
        !requestData ||
        Object.keys(requestData).length < 1 ||
        !requestData.userId 
      )
        throw apiFailureMessage.INVALID_PARAMS;

      let userDetails = await UserModel.findOne({ userId: requestData.userId });
      if (!userDetails) {
        throw apiFailureMessage.USER_NOT_EXISTS;
      }
    

      let accessToken = await this.getManagementAccessToken();
      const headers = {
        Authorization: `Bearer ${accessToken}`,
        "content-type": "application/json",
      };

      let requestObj = {
        
    client_id: requestData.userId
      };

      let resetPassResponse = await HttpService.executeHTTPRequest(
        httpConstants.METHOD_TYPE.GET,
        Config.AUTH0_DOMAIN,
        `v2/logout`,
        requestObj,
        headers
      );
     

      if (
        (resetPassResponse && resetPassResponse.error) ||
        resetPassResponse.statusCode
      )
        throw Utils.error(
          {},
          resetPassResponse.error || apiFailureMessage.RESET_PASSWORD_AUTH0,
          httpConstants.RESPONSE_CODES.FORBIDDEN
        );
     
      return resetPassResponse;
    } catch (error) {
      throw error;
    }
  };
}
