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
    statusConstants
} from "../../common/constants";
import Utils from "../../utils";
import AuthenticationController from "../auth0";
import AuthBLManager from "../auth0/manager";

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
        const pass = requestData.password


        try {
            requestData.name = requestData.name.toLowerCase();
            let userDetail = await UserSchema.find({name: requestData.name});

            if (userDetail && userDetail.length) {
                throw Utils.error(
                    {},
                    apiFailureMessage.USER_NAME_ALREADY_EXISTS,
                    httpConstants.RESPONSE_CODES.FORBIDDEN
                );
            }

            const [error, addUserRes] = await Utils.parseResponse(
                new AuthBLManager().signUp(requestData)
            );

            requestData["userId"] = addUserRes.userId;
            let hashPass = hash.MD5(pass)
            requestData["password"] = hashPass
            let userModel = new UserSchema(requestData);

            let userRes = await userModel.save()

            if (error)
                throw Utils.error(
                    {},
                    error.message || apiFailureMessage.USER_CREATE_AUTH0,
                    httpConstants.RESPONSE_CODES.FORBIDDEN
                );

            return userRes;
        } catch (error) {
            throw Utils.error(
                {},
                apiFailureMessage.USER_ALREADY_EXISTS,
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
}
