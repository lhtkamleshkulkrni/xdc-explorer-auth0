
import { apiFailureMessage, httpConstants } from "../../common/constants";
import HttpService from "../../service/http-service";
import Config from "../../../config/index";
import UserModel from "../../models/user";
import User from "../user/blManager"
import Utils from "../../utils";


export default class Manager {
    

    async getAccessTokenSignIn(email, password) {
        const data = {
             grant_type: 'password',
            username: email,
             password: password,
            domain: Config.AUTH0_DOMAIN,
            client_id: Config.AUTH0_CLIENT_ID,
            client_secret: Config.AUTH0_CLIENT_SECRET,
            audience: Config.AUTH0_MANAGEMENT_BASEURL,
            redirectUri: "",
            scope: Config.AUTH0_SCOPE,
            responseType: Config.AUTH0_RESPONSE_TYPE
     }

    
       
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

    

    getAccessToken = async () => {
        const data = {        
            grant_type: "client_credentials",
            client_id: Config.AUTH0_CLIENT_ID,
            client_secret: Config.AUTH0_CLIENT_SECRET,
            audience: Config.AUTH0_MANAGEMENT_BASEURL,
        };
       
        const headers = {
            "Content-Type": httpConstants.HEADER_TYPE.APPLICATION_JSON
        }
        const accessTokenResponse = await HttpService.executeHTTPRequest(httpConstants.METHOD_TYPE.POST, Config.AUTH0_DOMAIN, "oauth/token",data, headers).catch(err => {
            throw err;
        });
       console.log(accessTokenResponse)

        if (accessTokenResponse && (accessTokenResponse.error || accessTokenResponse.error_description))
            throw UtilMethods.errorResponse({}, accessTokenResponse.error_description || apiFailureMessage.INVALID_PARAMS,
                httpConstants.RESPONSE_CODES.FORBIDDEN);
        return accessTokenResponse.access_token;
    }

    getManagementAccessToken = async () => {
        const data = {        
            grant_type: "client_credentials",
            client_id: Config.AUTH0_MANAGEMENT_API_CLIENT_ID,
            client_secret: Config.AUTH0_MANAGEMENT_API_SECRET,
            audience: Config.AUTH0_MANAGEMENT_BASEURL,
        };
       
        const headers = {
            "Content-Type": httpConstants.HEADER_TYPE.APPLICATION_JSON
        }
        const accessTokenResponse = await HttpService.executeHTTPRequest(httpConstants.METHOD_TYPE.POST, Config.AUTH0_DOMAIN, "oauth/token",data, headers).catch(err => {
            throw err;
        });
       console.log(accessTokenResponse)

        if (accessTokenResponse && (accessTokenResponse.error || accessTokenResponse.error_description))
            throw UtilMethods.errorResponse({}, accessTokenResponse.error_description || apiFailureMessage.INVALID_PARAMS,
                httpConstants.RESPONSE_CODES.FORBIDDEN);
        return accessTokenResponse.access_token;
    }

    async signIn(request) {
        if(!request || !request.email || !request.password)
            throw {message:"email and password are required"}
        const accessToken = await this.getAccessTokenSignIn(request.email, request.password).catch(err => {
            throw err
        });
        console.log("accseeewes",accessToken)
        const headers = {
            "Content-Type": httpConstants.HEADER_TYPE.APPLICATION_JSON,
            Authorization: `Bearer ${accessToken}`
        }
        const userInfoRes = await HttpService.executeHTTPRequest(httpConstants.METHOD_TYPE.POST, Config.AUTH0_DOMAIN, "userinfo", {}, headers).catch(err => {
            throw err;
        });
        return userInfoRes;
    }
    
    

    
     updateUser = async (request) => {
        let accessToken = await this.getManagementAccessToken();
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
               
                "client_id": Config.AUTH0_CLIENT_ID,
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
