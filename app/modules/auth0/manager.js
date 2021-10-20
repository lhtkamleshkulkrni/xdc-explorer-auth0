
import { apiFailureMessage, httpConstants } from "../../common/constants";
import HttpService from "../../service/http-service";
import Config from "../../../config/index";
import UserModel from "../../models/user";


export default class Manager {
    async signIn(request) {
        if(!request || !request.email || !request.password)
            throw {message:"email and password are required"}
        const accessToken = await this.getAccessToken(request.email, request.password).catch(err => {
            throw err
        });
        console.log(accessToken)
        const headers = {
            "Content-Type": httpConstants.HEADER_TYPE.APPLICATION_JSON,
            Authorization: `Bearer ${accessToken}`
        }
        const userInfoRes = await HttpService.executeHTTPRequest(httpConstants.METHOD_TYPE.POST, Config.AUTH0_DOMAIN, "userinfo", {}, headers).catch(err => {
            throw err;
        });
        return userInfoRes;
    }

    async getAccessToken(email, password) {
        const data = {
            grant_type: 'password',
            username: email,
            password: password,
            domain: Config.AUTH0_DOMAIN,
            client_id: Config.AUTH0_MANAGEMENT_API_CLIENT_ID,
            client_secret: Config.AUTH0_MANAGEMENT_API_SECRET,
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
}
