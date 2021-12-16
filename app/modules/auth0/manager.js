import { apiFailureMessage, httpConstants, genericConstants, amqpConstants } from "../../common/constants";
import HttpService from "../../service/http-service";
import Config from "../../../config/index";
import UserModel from "../../models/user";
import User from "../user/blManager";
import Utils from "../../utils";
import BlManager from "./index";
import UserSchema from "../../models/user";
import RabbitMqController from "../queue/index";
import EmailTemplate from '../../common/emailTemplate'
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
      throw Utils.error(
        {},
        accessTokenResponse.error_description ||
        apiFailureMessage.INVALID_PARAMS,
        httpConstants.RESPONSE_CODES.FORBIDDEN
      );
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
      throw Utils.error(
        {},
        accessTokenResponse.error_description ||
        apiFailureMessage.INVALID_PARAMS,
        httpConstants.RESPONSE_CODES.FORBIDDEN
      );
    return accessTokenResponse.access_token;
  };

  async signIn(request) {
    try {
      let userDetail = await UserSchema.find({ name: request.name });

      const accessToken = await this.getAccessTokenSignIn(
        userDetail[0].email,
        request.password
      ).catch((err) => {
        throw err;
      });

      const headers = {
        "Content-Type": httpConstants.HEADER_TYPE.APPLICATION_JSON,
        Authorization: `Bearer ${accessToken}`,
      };
      const userInfoRes = await HttpService.executeHTTPRequest(
        httpConstants.METHOD_TYPE.POST,
        Config.AUTH0_DOMAIN,
        "userinfo",
        {},
        headers
      ).catch((err) => {
        throw err;
      });


      const newReturnObject = {
        userInfoRes,

        accessToken,
      };
      return newReturnObject;
    } catch (error) {
      throw Utils.error(
        {},
        apiFailureMessage.INVALID_PARAMS,
        httpConstants.RESPONSE_CODES.FORBIDDEN
      );
    }
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
    await HttpService.executeHTTPRequest(
      httpConstants.METHOD_TYPE.POST,
      Config.AUTH0_DOMAIN,
      `api/v2/jobs/verification-email`,
      userId,
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
      if (
        !requestData ||
        Object.keys(requestData).length < 1 ||
        !requestData.email
      )
        throw apiFailureMessage.INVALID_PARAMS;
      let user = await UserModel.findOne({ email: requestData.email });
      if (!user) {
        throw apiFailureMessage.USER_NOT_EXISTS;
      }
      let request = {
        email: requestData.email,
        password: this.generatePassword(),
        userId: user.userId
      }
      let forgotPassResponse = await this.requestChangePassword(request)
      if (forgotPassResponse.email && forgotPassResponse.email === requestData.email)
        await this.sendDataToQueue("INOUT", forgotPassResponse, request, user);
      return { result: `Email has been sent to ${forgotPassResponse.email}` };
    } catch (error) {
      throw error;
    }
  };



  getMailNotificationResponse(type, user , request) {
    return {
      "title": "Reset Password [XDC Explorer]",
      "description": EmailTemplate.createEmail(user.name, user.name, request.password),
      "timestamp": Date.now(),
      "userID": user.userId,
      "postedTo": user.email,
      "postedBy": 'Xinfin Explorer',
      "payload": { user: user.userId },
      "type": genericConstants.NOTIFICATION_TYPE.EMAIL,
      "sentFromEmail": Config.POSTED_BY,
      "sentFromName": "XIN FIN Explorer",
      "addedOn": Date.now(),
      "isSendGrid": true
    }
  }
  async sendDataToQueue(type, forgotPassResponse, request, user) {

    let mailNotificationRes = this.getMailNotificationResponse(type, user , request)
    let rabbitMqController = new RabbitMqController();
    Utils.lhtLog("sendDataToQueue", "sendDataToQueue", {}, "kajal", httpConstants.LOG_LEVEL_TYPE.INFO)
    await rabbitMqController.insertInQueue(Config.NOTIFICATION_EXCHANGE, Config.NOTIFICATION_QUEUE, "", "", "", "", "", amqpConstants.exchangeType.FANOUT, amqpConstants.queueType.PUBLISHER_SUBSCRIBER_QUEUE, JSON.stringify(mailNotificationRes));

  }

  generatePassword(len) {
    var length = 10
    var string = "abcdefghijklmnopqrstuvwxyz"; //to upper 
    var numeric = '0123456789';
    var punctuation = '!@#$%^&*()_+~`|}{[]\:;?><,./-=';
    var password = "";
    var character = "";
    var crunch = true;
    while( password.length<length ) {
        let entity1 = Math.ceil(string.length * Math.random()*Math.random());
        let entity2 = Math.ceil(numeric.length * Math.random()*Math.random());
        let entity3 = Math.ceil(punctuation.length * Math.random()*Math.random());
        let hold = string.charAt( entity1 );
        hold = (password.length%2==0)?(hold.toUpperCase()):(hold);
        character += hold;
        character += numeric.charAt( entity2 );
        character += punctuation.charAt( entity3 );
        password = character;
    }
    password=password.split('').sort(function(){return 0.5-Math.random()}).join('');
    return password.substr(0,len);
  }


  async requestChangePassword(requestData) {
    //  changePassword Function business logic
    const [accessTokenError, accessToken] = await Utils.parseResponse(this.getManagementAccessToken());
    if (!accessToken)
      throw Utils.error({}, accessTokenError || apiFailureMessage.INVALID_PARAMS,
        httpConstants.RESPONSE_CODES.FORBIDDEN);
    let headers = {
      Authorization: `Bearer ${accessToken}`,
      "content-type": httpConstants.HEADER_TYPE.APPLICATION_JSON
    }
    let requestObj = {
      password: requestData.password,
      connection: 'Username-Password-Authentication'
    }
    const resetPassResponse = await HttpService.executeHTTPRequest(httpConstants.METHOD_TYPE.PATCH, Config.AUTH0_DOMAIN, `api/v2/users/${requestData.userId}`, requestObj, headers);
    if (resetPassResponse && resetPassResponse.error || resetPassResponse.statusCode)
      throw Utils.error(resetPassResponse, resetPassResponse.error || apiFailureMessage.RESET_PASSWORD_AUTH0, httpConstants.RESPONSE_CODES.FORBIDDEN);
    return resetPassResponse;
  }


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
        given_name: requestData.name,
        name: requestData.name,
        nickname: requestData.name,
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

    if (!requestData)
      throw Utils.error(
        {},
        apiFailureMessage.INVALID_PARAMS,
        httpConstants.RESPONSE_CODES.FORBIDDEN
      );
    try {
      let userDetails = await UserModel.findOne({ userId: requestData.userId });
      if (!userDetails) {
        throw apiFailureMessage.USER_DOES_NOT_EXISTS;
      }

      let accessToken = await this.getManagementAccessToken();
      const headers = {
        Authorization: `Bearer ${accessToken}`,
        "content-type": "application/json",
      };

      let requestObj = {
        client_id: requestData.userId,
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
