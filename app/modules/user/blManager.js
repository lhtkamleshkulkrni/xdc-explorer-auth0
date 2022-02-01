import UserSchema from "../../models/user";
import UserCookiesSchema from "../../models/cookies";
import {
    AdminRoles,
    Consents,
    apiFailureMessage,
    apiSuccessMessage,
    Auth0RoleNameConstants,
    emailTitles,
    genericConstants,
    httpConstants,
    portalType,
    statusConstant,
    statusConstants,
    globalIdConstants
} from "../../common/constants";
import Utils from "../../utils";
import AuthenticationController from "../auth0";
import AuthBLManager from "../auth0/manager";
import Config from '../../../config';
import HttpService from "../../service/http-service";
// import * as globalidCrypto from 'globalid-crypto-library';
import * as gidCrypto from 'globalid-crypto-library'
import fs from "fs";
import * as jwt from 'jsonwebtoken'
import {filter, isEmpty, flattenDeep, map, _} from 'lodash'

const hash = require("object-hash");
export default class BlManager {
    async updateUser(request) {
        try {
            if (!request || !request.userId)
                throw Utils.error({}, apiFailureMessage.INVALID_PARAMS, httpConstants.RESPONSE_CODES.FORBIDDEN);
            let user = await UserSchema.findOne({userId: request.userId})
            if (!user) {
                throw apiFailureMessage.USER_DOES_NOT_EXISTS
            }
            let userDetail = await UserSchema.find({name: request.name});

            if (userDetail && userDetail.length) {
                throw Utils.error(
                    {},
                    apiFailureMessage.USER_NAME_ALREADY_EXISTS,
                    httpConstants.RESPONSE_CODES.FORBIDDEN
                );
            }
            let userEmail = await UserSchema.find({email: request.email});
            if (userEmail && userEmail.length) {
                throw Utils.error(
                    {},
                    apiFailureMessage.USER_MAIL_ALREADY_EXISTS,
                    httpConstants.RESPONSE_CODES.FORBIDDEN
                );
            }
            let updateObj = {
                ...user._doc,
                modifiedOn: new Date().getTime()
            }
            let auth0Req = {}


            if (request.name) {
                auth0Req['given_name'] = request.name
                auth0Req['nickname'] = request.name
                auth0Req['name'] = request.name
                updateObj['name'] = request.name
            }

            if (request.profilePic)
                updateObj['profilePic'] = request.profilePic
            auth0Req['picture'] = request.profilePic

            if (request.email) {
                auth0Req['email'] = request.email
                updateObj['email'] = request.email
            }
            if (auth0Req && Object.keys(auth0Req) && Object.keys(auth0Req).length) {
                auth0Req['userId'] = request.userId
                await new AuthBLManager().updateUser(auth0Req)
            }

            return UserSchema.findOneAndUpdate({
                userId: request.userId
            }, {
                $set: {...updateObj}
            }, {new: true});
        } catch (error) {
            throw error
        }

    }

    async getUserByUserId(request) {
        if (!request)
            throw Utils.error({}, apiFailureMessage.INVALID_PARAMS, httpConstants.RESPONSE_CODES.FORBIDDEN);

        return await UserSchema.getUserDetails({name: request.name})

    }

    signUp = async (requestData) => {
        if (!requestData)
            throw Utils.handleError(
                {},
                apiFailureMessage.INVALID_PARAMS,
                httpConstants.RESPONSE_CODES.FORBIDDEN
            );
        // const pass = requestData.password
        try {
            // requestData.name = requestData.name.toLowerCase();
            // let userDetail = await UserSchema.find({name: requestData.name});

            // if (userDetail && userDetail.length) {
            //     throw Utils.error(
            //         {},
            //         apiFailureMessage.USER_NAME_ALREADY_EXISTS,
            //         httpConstants.RESPONSE_CODES.FORBIDDEN
            //     );
            // }

            // const [error, addUserRes] = await Utils.parseResponse(
            //     new AuthBLManager().signUp(requestData)
            // );
            requestData["userId"] = requestData.userId ? requestData.userId: "";
            // let hashPass = hash.MD5(pass)
            // requestData["password"] = hashPass
            let userModel = new UserSchema(requestData);
            let userRes = await userModel.save()
            // if (error)
            //     throw Utils.error(
            //         {},
            //         error.message || apiFailureMessage.USER_CREATE_AUTH0,
            //         httpConstants.RESPONSE_CODES.FORBIDDEN
            //     );

            return userRes;
        } catch (error) {
            throw Utils.error(
                {},
                error && error.message ? error.message :  apiFailureMessage.USER_ALREADY_EXISTS,
                httpConstants.RESPONSE_CODES.FORBIDDEN
            );
        }
    };

    addUserCookies = async (requestData) => {
        if (!requestData)
            throw Utils.error({}, apiFailureMessage.INVALID_PARAMS, httpConstants.RESPONSE_CODES.FORBIDDEN);
        const UserCookies = new UserCookiesSchema(requestData);
        return UserCookies.save();
    }

    getCookiesOfUser = async(requestData)=>{
        if (!requestData || !requestData.userId)
            throw Utils.error({}, apiFailureMessage.INVALID_PARAMS, httpConstants.RESPONSE_CODES.FORBIDDEN);
        return UserCookiesSchema.findOne({userId: requestData.userId});
    }

    updateCookiesOfUser = async(requestData)=>{
        if (!requestData || !requestData.userId || !requestData.cookiesAllowed)
            throw Utils.error({}, apiFailureMessage.INVALID_PARAMS, httpConstants.RESPONSE_CODES.FORBIDDEN);
        return UserCookiesSchema.findAndUpdateData({userId: requestData.userId}, {cookiesAllowed:requestData.cookiesAllowed});
    }

    globalIdUserInfo = async (requestData) => {
        try{
        if (!requestData || !requestData.idToken || !requestData.accessToken)
            throw Utils.error({}, apiFailureMessage.INVALID_PARAMS, httpConstants.RESPONSE_CODES.FORBIDDEN);
        let claims = await this.decryptClainTokens(requestData.idToken, requestData.accessToken);
        if(!claims || !claims.length || !claims[0].length)
            throw Utils.error({}, apiFailureMessage.INVALID_PARAMS, httpConstants.RESPONSE_CODES.FORBIDDEN);
        claims = claims[0];    
        const email = claims.find( claim => {
            if(claim.type === "email" && claim.value) return claim.value;
        } );
        if(!email)
            throw Utils.error({}, apiFailureMessage.NO_EMAIL_FOUND, httpConstants.RESPONSE_CODES.FORBIDDEN);  
            
        const checkUser = await UserSchema.getUserDetails({email:email.value, authenticationProvider:"GLOBALID"})
        if(checkUser)  
            return checkUser;
        return await this.globalIdSignUp(requestData, claims);
        }catch(error){
            throw error;
        }
    }

    globalIdSignUp =async (requestData,claims) =>{
        try{
        let responseData = {}
        let identities = await this.getUserIdentities(requestData.accessToken)
        identities = JSON.parse(identities); 
        claims.map(claim=>{
            if(claim.type && claim.value) 
               responseData = {...responseData , [globalIdConstants[claim.type]]:claim.value}
        });   
       responseData= {...responseData ,
             userId: identities.gid_uuid ,
             name: identities.gid_name,
             profilePic:identities.display_image_url,
             authenticationProvider:"GLOBALID",
             countryName:identities.country_name,
             countryCode:identities.country_code
           }     
       let userModel = new UserSchema(responseData);
       let userRes = await userModel.save();
       return userRes;
        }catch(error){
            throw error;
        }
    }
    getGlobalIdTokens= async (requestData) => {
        if (!requestData || !requestData.code)
            throw Utils.error({}, apiFailureMessage.INVALID_PARAMS, httpConstants.RESPONSE_CODES.FORBIDDEN);
        let accessAndIdToken=JSON.parse(await this.accessAndIdToken(requestData.code));
          if(!accessAndIdToken || !accessAndIdToken.id_token || !accessAndIdToken.access_token){
            throw Utils.error({}, apiFailureMessage.INVALID_SESSION_TOKEN, httpConstants.RESPONSE_CODES.FORBIDDEN);
        }
        return accessAndIdToken;
    }

    async accessAndIdToken(codes) {
        let URL = Config.GLOBAL_ID_API_URL + "auth/token";
        let headers = {
            'Content-Type': 'application/json'
        };
        let data = {
            "client_id": Config.GLOBAL_ID_CLIENT_ID,
            "client_secret": Config.GLOBAL_ID_CLIENT_SECRET,
            "grant_type": "authorization_code",
            "refresh_token": "string",
            "code": codes,
            "redirect_uri": Config.GLOBAL_ID_REDIRECT_URL
        }
        return await HttpService.executeHTTPRequest(httpConstants.METHOD_TYPE.POST, URL, "",data, headers);
    }

    async getUserIdentities(accessToken) {
        let URL ="https://api.global.id/v1/identities/me";
        let headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        };
        return await HttpService.executeHTTPRequest(httpConstants.METHOD_TYPE.GET, URL, "",{}, headers);
    }
   
    async getTokensForThePII(id_token) {
        const decoded_token = jwt.decode(id_token);
        let consents = await _.filter(decoded_token, (value, index) => {
            return _.includes(index, 'idp.globalid.net/claims/') && _.isEmpty(value) !== true
        });
        console.log("consents", consents);
        let response;
        try {
            response = _.flattenDeep(await Promise.all(consents.map(this.decryptedConsent)));
            console.log("response", response);
        } catch (err) {
            console.log("err", err);
        }
        return response;
    }

    async decryptedConsent(consent) {
        console.log("consent", consent);
        // let privates=process.env.PRIVATE_KEY;
        return Promise.all(
            _.map(consent, async (values) =>
                Promise.all(
                    _.map(values, async (value) =>
                        gidCrypto.RSA.decrypt(Config.PRIVATE_KEY, value),
                    ),
                ),
            ),
        )
    }


    // async claimTokenUsingIdToken(idToken) {
    //     idToken = "REMOVED";
    //     try {
    //         let password = fs.readFileSync(__dirname + "/private.key")
    //         const result = globalidCrypto.RSA.decrypt(password.toString('utf8'), "observer");
    //         console.log("result", result);
    //     } catch (err) {
    //         console.log("err", err);
    //     }
    // }


    async decryptClainTokens(idToken, accessToken) {
        const decoded_token = jwt.decode(idToken)
        const consents = (filter(decoded_token, (value, index) => index.includes('idp.globalid.net/claims/') && !isEmpty(value)))
        const result = [];
        for(let index=0; index< consents.length; index++){
            const res = await this.decryptPrivateDataTokenPerConsent(consents[index], accessToken);
            result.push(res);
        }
        return result;
    }

    async decryptPrivateDataTokenPerConsent(consent, accessToken) {
        let data = await this.decryptedConsent(consent);
        data = data.filter(arr => {
            if (arr.length)
                return arr;
        })

        let result = [];
        for (let index = 0; index < data.length; index++) {
            const obj = await this.getPIIData(data[index], accessToken)
            result.push(JSON.parse(obj));
        }
        result = result[0];
        const response = []
        for (let index = 0; index < result.length; index++) {
            let password = gidCrypto.RSA.decrypt(Config.PRIVATE_KEY, result[index].encrypted_data_password);
            const tokenData = gidCrypto.AES.decrypt(result[index].encrypted_data, password);
            response.push(JSON.parse(tokenData));
        }
        return response;
    }

    async decryptedConsent(consent) {
        return Promise.all(
            _.map(consent, async (values) =>
                Promise.all(
                    _.map(values, async (value) =>
                        gidCrypto.RSA.decrypt(Config.PRIVATE_KEY, value)
                    ),
                ),
            ),
        )
    }


    async getPIIData(codes, accessToken) {
        let URL = Config.GLOBAL_ID_API_URL + "vault/get-encrypted-data";
        let headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        };
        let data = {
            private_data_tokens: codes
        }
        return await HttpService.executeHTTPRequest(httpConstants.METHOD_TYPE.POST, URL, "", data, headers);
    }

    async decryptPIIInfo() {

    }
}