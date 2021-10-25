
import { apiFailureMessage, httpConstants } from "../../common/constants";
import HttpService from "../../service/http-service";
import Config from "../../../config/index";
import UserModel from "../../models/user";
import User from "../user/blManager"
import Utils from "../../utils";


export default class Manager {
    async getAccessToken(email,password) {
         const data = {
            grant_type: 'client_credentials',
            
            domain: Config.AUTH0_DOMAIN,
            client_id: Config.AUTH0_MANAGEMENT_API_CLIENT_ID,
            client_secret: Config.AUTH0_MANAGEMENT_API_SECRET,
            audience: Config.AUTH0_MANAGEMENT_BASEURL,
            // redirectUri: "",
            // scope: Config.AUTH0_SCOPE,
            // responseType: Config.AUTH0_RESPONSE_TYPE
            

        }
       // {"client_id":"tLlSmfkdd53hvHPORl7D9MHFPdAxbcsn","client_secret":"00_CDBuwB4HpRAGVwA4gnpbq0_Uc4fw8OuceEWys-LSl5PyTpQUFAjPJjr1T28SK","audience":"https://xdcnetwork.us.auth0.com/api/v2/","grant_type":"client_credentials"}
        const headers = {
            "Content-Type": httpConstants.HEADER_TYPE.APPLICATION_JSON
        }
        const accessTokenResponse = await HttpService.executeHTTPRequest(httpConstants.METHOD_TYPE.POST, Config.AUTH0_DOMAIN, "oauth/token", data, headers).catch(err => {
            throw err;
        });
       console.log(accessTokenResponse)

        if (accessTokenResponse && (accessTokenResponse.error || accessTokenResponse.error_description))
            throw UtilMethods.errorResponse({}, accessTokenResponse.error_description || apiFailureMessage.INVALID_PARAMS,
                httpConstants.RESPONSE_CODES.FORBIDDEN);
        return accessTokenResponse.access_token;
    }

    // async signIn(requestData) {
    //     if(!request || !requestData.email || !requestData.password)
    //         throw {message:"email and password are required"}
    //     const accessToken = await this.getAccessToken(requestData.email, requestData.password).catch(err => {
    //         throw err
    //     });
    //     console.log(accessToken)
    //     const headers = {
    //         "Content-Type": httpConstants.HEADER_TYPE.APPLICATION_JSON,
    //         Authorization: `Bearer ${accessToken}`

    //     }
    
    //     const userInfoRes = await HttpService.executeHTTPRequest(httpConstants.METHOD_TYPE.POST, Config.AUTH0_DOMAIN, "userinfo", {}, headers).catch(err => {
    //         throw err;
    //     });
    //     console.log(userInfoRes)
    //     return userInfoRes;
    // }

    signIn = async (username, password) => {
        let accessToken = await this.getAccessToken();
        const headers = {
            "Authorization": `Bearer ${accessToken}`,
            "content-type": "application/json"
        };
        const token_body = {
            realm: Config.AUTH0_CONNECTION,
            client_id: Config.AUTH0_CLIENT_ID,
            scope: Config.AUTH0_SCOPE,
            grant_type: "password",
            username,
            password
        };
        const headers = { "content-type": "application/json" };
        let accessTokenResponse = await HttpService.executeHTTPRequest(httpConstants.METHOD_TYPE.POST, Config.AUTH0_DOMAIN, 'oauth/token', token_body, headers);
        if (accessTokenResponse && (accessTokenResponse.error || accessTokenResponse.error_description))
            throw Utils.error({}, accessTokenResponse.error_description || apiFailureMessage.INVALID_PARAMS,
                httpConstants.RESPONSE_CODES.FORBIDDEN);

        return accessTokenResponse
    }
    

    
    updateUser = async (request) => {
        let accessToken = await this.getAccessToken();
        const headers = {
            "Authorization": `Bearer ${accessToken}`,
            "content-type": "application/json"
        };
        let userId = request.userId
        delete request.userId
        let updateRes = await HttpService.executeHTTPRequest(httpConstants.METHOD_TYPE.PATCH, Config.AUTH0_DOMAIN, `api/v2/users/${userId}`, request, headers);

        if (!updateRes || updateRes.error)
            throw Utils.error([], updateRes.message ? updateRes.message : apiFailureMessage.UPDATE_USER, httpConstants.RESPONSE_CODES.FORBIDDEN);
        return updateRes
    }

    forgotPassword = async (request) => {
        try {
            if (!request || Object.keys(request).length < 1 || !request.email)
                throw apiFailureMessage.INVALID_PARAMS;

            let user = await UserModel.findOne({ email: request.email })
            if (!user) {
                throw apiFailureMessage.USER_NOT_EXISTS
            }
            const headers = { "content-type": "application/json" };
            let requestObj = {
                "client_id": Config.AUTH0_MANAGEMENT_API_CLIENT_ID,
                "connection": Config.AUTH0_CONNECTION,
                "email": request.email,
            }

            let forgotPassResponse = await HttpService.executeHTTPRequest(httpConstants.METHOD_TYPE.POST, Config.AUTH0_DOMAIN, `dbconnections/change_password`, requestObj, headers);
            console.log("forgotPassResponse===", forgotPassResponse);

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
    
          console.log("signupResponse===", signupResponse);
    
          if ((signupResponse && signupResponse.error) || signupResponse.statusCode)
            throw signupResponse.message || apiFailureMessage.USER_CREATE_AUTH0;
    
          requestData["userId"] = signupResponse.user_id;
    
          return requestData;
        } catch (error) {
          throw error;
        } 
    }
    changeEmail = async (requestData) => {
        if (!requestData || Object.keys(requestData).length < 1 || !requestData.userId || !requestData.email)
            throw Utils.error([], apiFailureMessage.INVALID_PARAMS, httpConstants.RESPONSE_CODES.FORBIDDEN);

        let accessToken = await this.getAccessToken();
        const headers = {
            "Authorization": `Bearer ${accessToken}`,
            "content-type": "application/json"
        };

        let requestObj = {
            "connection": Config.AUTH0_CONNECTION,
            "email": requestData.email,
            "email_verified": false,
            "verify_email": false
        }
        let emailObj = {
            user_id: requestData.userId,
        }

        let changeEmailResponse = await HttpService.executeHTTPRequest(httpConstants.METHOD_TYPE.PATCH, Config.AUTH0_DOMAIN, `api/v2/users/${requestData.userId}`, requestObj, headers);
        await HttpService.executeHTTPRequest(httpConstants.METHOD_TYPE.POST, Config.AUTH0_DOMAIN, `api/v2/jobs/verification-email`, emailObj, headers);

        if (changeEmailResponse && changeEmailResponse.error || changeEmailResponse.statusCode)
            throw Utils.error({}, changeEmailResponse.error || apiFailureMessage.RESET_PASSWORD_AUTH0, httpConstants.RESPONSE_CODES.FORBIDDEN);

        return changeEmailResponse;
    };
    changePassword = async (requestData) => {
        try {
            if (!requestData || Object.keys(requestData).length < 1 || !requestData.userId || !requestData.newPassword || !requestData.oldPassword)
                throw apiFailureMessage.INVALID_PARAMS;

            let userDetails = await UserModel.findOne({ userId: requestData.userId });
            if (!userDetails) {
                throw apiFailureMessage.USER_NOT_EXISTS
            }
            try {
                await this.signIn(userDetails.email, requestData.oldPassword)
            } catch (error) {
                throw `You have entered wrong old password`;
            }
            let accessToken = await this.getAccessToken();
            const headers = {
                "Authorization": `Bearer ${accessToken}`,
                "content-type": "application/json"
            };

            let requestObj = {
                "connection": Config.AUTH0_CONNECTION,
                "password": request.newPassword,
            }

            let resetPassResponse = await HttpService.executeHTTPRequest(httpConstants.METHOD_TYPE.PATCH, Config.AUTH0_DOMAIN, `api/v2/users/auth0|${userDetails.userId}`, requestObj, headers);
            console.log("resetPassResponse===", resetPassResponse);

            if (resetPassResponse && resetPassResponse.error || resetPassResponse.statusCode)
                throw Utils.error({}, resetPassResponse.error || apiFailureMessage.RESET_PASSWORD_AUTH0, httpConstants.RESPONSE_CODES.FORBIDDEN);
console.log("resetPassResponse===", resetPassResponse)
            return resetPassResponse;
        } catch (error) {
            throw error
        }
    };
    
}
