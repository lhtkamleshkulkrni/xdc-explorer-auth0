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
import Config from '../../../config';
import HttpService from "../../service/http-service";
import * as globalidCrypto from 'globalid-crypto-library';
import fs from "fs";

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

    globalIdUserInfo = async(requestData)=>{
        if (!requestData || !requestData.token)
            throw Utils.error({}, apiFailureMessage.INVALID_PARAMS, httpConstants.RESPONSE_CODES.FORBIDDEN);
        let accessAndIdToken=JSON.parse(await this.accessAndIdToken(requestData.token));
        return accessAndIdToken.id_token;
        // console.log("accessAndIdToken",accessAndIdToken);
        // console.log("accessAndIdToken",accessAndIdToken.id_token);
        let piiInfo=await this.claimTokenUsingIdToken(accessAndIdToken.id_token);
    }

    async accessAndIdToken(codes){
        let URL=Config.GLOBAL_ID_API_URL+"auth/token";
        let headers={
            'Content-Type': 'application/json'
        };
        let data={
            "client_id": Config.GLOBAL_ID_CLIENT_ID,
            "client_secret": Config.GLOBAL_ID_CLIENT_SECRET,
            "grant_type": "authorization_code",
            "refresh_token": "string",
            "code":codes,
            "redirect_uri": Config.GLOBAL_ID_REDIRECT_URL
        }
        return await HttpService.executeHTTPRequest(httpConstants.METHOD_TYPE.POST, URL, "", JSON.stringify(data), headers);
    }

    async claimTokenUsingIdToken(idToken){
        idToken="accessAndIdToken eyJhbGciOiJSUzI1NiIsImtpZCI6InB1YmxpYzpkMGM2M2RhNi1lNzkzLTRhNTctYWI3MC1kMmY4MTFlZjA1MzYifQ.eyJhdF9oYXNoIjoiVUpwdk1EeEtUZS1ON2NtTEVsU1k2ZyIsImF0dGVzdGF0aW9ucyI6WyI5NGMyYzA0Ni1jYmMxLTQ1N2QtYmQwOC0wNTYwOWIzMzMzZGUiXSwiYXVkIjpbIjgwOGU3OTFhLTcwYjQtNDNhNC1iYjMwLTZmMzNjNjEwZDRlYyJdLCJhdXRoX3RpbWUiOjE2NDMyNzQ2MzgsImV4cCI6MTY0MzI4MTg1NiwiaWF0IjoxNjQzMjc0NjU2LCJpZHAuZ2xvYmFsaWQubmV0L2NsYWltcy8zNWZkZTMyNC03NzM2LTQ5MWEtYjg5Zi1jMjk4NTQ0MTczMDAiOnsiMjBjNjE0YjQtMzRkNy00N2I1LWI2YWYtMWM5NGFlZmJhOTQxIjpbXSwiMjFmMWM2NGUtNWRmNS00YzI0LTg5OTYtNGVlMDhkYTEwNDA5IjpbXSwiMjhjNTU3YTMtMjM1OC00YzU5LWJhM2EtYzQxNTA5MTlmNjgwIjpbXSwiM2ViMGVkMTMtMjY5NS00YjhlLThhNTAtM2IwOGQyZTgwNTljIjpbXSwiNDA5MjNiOWUtMTQ2Ny00MTNlLWE5M2EtNTE0MWUyOWYwYWY0IjpbXSwiNGZiMmFhNzQtNmMwYi00ZTRhLTg2Y2ItODlmYmVlNTRlYTIwIjpbXSwiNTY2ZTQ0MDctYTMzNi00MTYyLWJlOGYtNjFmNjAyMjFiYjVmIjpbXSwiNmUwODY4MmYtZjYwNy00MDc0LWJjMTctY2JjYWI3OTNmYWNlIjpbXSwiODFlY2VkNTEtODRiMC00YzJkLWE1ZDgtYTJlMjk5NDk5Y2QzIjpbImhzUk9zR2VJSG5oeFIxbTF5QzhPOVVUV3lMSllqdkd1ZzhFNC82VmtCM2hIMnpsazRYcEMzT3hpNUt1Ti9FSVMxQUlreTlUNTN3dzI2aGc2Mk5nRFNpOExVaU5aYjBaeUFxeVhzemV2cUpCKzVabDVJelEybnJ1OXB4d2JWLzlxYjh3NkRUVVhKcnZSOTVLS2k1WEdyK213cHI5ZWtTY1MrMWNxM0F2czhmeDZXVUdyRTNnT0dMaHJxZlovai9MN0J3N2xvZ1hmd3FEN2hCTmd1ekRZcFdOeFdnUHRJREVsTitPcGNwcUZIV1lZRDdSZFowQUZoWlFFRUVTWldva3VKNWVjL3pTSk1Pa2NJLzFVemVpaGVBZEhmOTRFcHNLZXN2QnRFWnJYc3pNdjNHVHJQZXZ3ckI1Ykw4VlAvYWVDOXBmeWRITWxkeG9uU1dOSjlTTVZ0enJ5S2FLNE5ZenJwdUliU1hjR2h3TGdVZ1JkTXcrUkJLUVpqUnBvdjVJZVkzUXBMQUV1WE80clBQQU5MZWc0a3VhOU8zSi9tRkJXdnY1RG9MM2xCclBtRkxYR1V0OTlLTU1xSmZjRCsrRnM2ZDVGU1hkZDVaK01IdGVFc3J0YkJpQTFsRXVnaC96UWo2b0hsblp0alVTaGdpcmdNbzcvemtEeTNKQnlYYjl6NDJDbHFuN3FBSDNyZ1hvYTlRV0Nyc3d5eGMyMjNGVDFzcXhkMTRvWXkzYVNNZ2d3Ri9aM3dCRkdrNGY5Zy96c3ZIaGZqRHd1c3Ruekd0b1ZUWGZ1ZmtCSHcwdnd0aFMxYmRlN3JicTZpVVRTV09hSU1UNFdScnNoS210eUNSMTVwSXdnRXpubHRUM0RJTS9mRE1OckJkUHdIZXA3RTVLT2QxNW9kQTRUbHpzPSJdLCI4Yzg4ZmQ4Yy00ODg2LTQzZGItODY4Ny1lZmExYjk0YTY1MTYiOltdLCJiMGFhZWM1Yy1jNjk4LTRhNDctYTg4Mi0wODA4NDA0NzdjNDUiOltdLCJiMjMwZTM0OS1kNjk5LTQ5ODAtYjljNS0yMzUwYmY3ZGU2YTgiOltdLCJjOWQwZjBjNi04NWE4LTQxZGQtODJhZi01OWJjNGZmZGY0NjciOltdLCJmZGRjZDlhZC05OWViLTRkNzktOWRmNi00ZGVlYzMyZGVlZDIiOltdfSwiaWRwLmdsb2JhbGlkLm5ldC9jbGFpbXMvYjM0NzJkNDEtNzYyMC00ZTFjLThlNjItNjJkNTczNDc0MmNmIjp7IjAzM2JiOGFkLWQ1YmUtNDE1Ni1hMDMyLTliNzFhYTUyNjdkOSI6W10sIjA2MjdmN2RkLTRjMTEtNDk2Ny04MWRlLWZhMGRlNTA4NDU3MiI6W10sIjA4OTk4Njk1LWZjZWYtNDQ4Yi1hMTZiLTlhNjY3Y2VmYjZkOCI6W10sIjQzM2I0MmE3LTM3YWYtNDNkZi05YTM4LThmY2RmYTNjNzdlNyI6W10sIjQ5OTdkNDVhLTllNjQtNGJjOC1iYzdiLTNlMTUyNjJiZGQ3ZSI6W10sIjRhYmRiNjU1LWNiZGQtNDM5NS05ZjdiLTNhYTRiMGQ3N2YzYiI6W10sIjVkMmUzZjUyLTg0NjUtNDY5MS04OTA0LWU5NjY1ZWZkMjI5ZSI6W10sImI0MzVmYWJlLTIyMmMtNGY2Zi05NTc1LTAwZTI5MmVhZDE2MCI6W10sImRmMTgwZjIzLTk5M2UtNGU0Yy1hZTQxLTdlZjIwYzU2ZTc1OCI6W10sImZkN2I3MWE4LWIzNzAtNDJlZC04Mjk2LTY2ZTViMmE3NzdkNyI6W119LCJpZHAuZ2xvYmFsaWQubmV0L2NsYWltcy9iNmY0N2IxMC05ZjY4LTQwOTMtYjdlOC02Yzc0NjI4MzMxNjkiOnsiZGE0Y2U5NDMtZTM2Yy00MmJkLTgzNzktOTVhYzE2ZTBhOGE5IjpbXX0sImlzcyI6Imh0dHBzOi8vZ2xvYmFsLmlkLyIsImp0aSI6IjBiOTgyMzRmLWVmYzAtNDExYy1iZTJjLTNlNzg5NDZlNzhkNSIsIm5vbmNlIjoiMTIzNDU2NzgiLCJyYXQiOjE2NDMyNzQ2MzgsInNpZCI6ImY2NmYzMjQ5LWZiMzEtNDg1OC04ZjUyLTc5NTNkMjhiYzFmNyIsInN1YiI6ImI5MjFkMDI0LTUzZmEtNDE4ZS1hODljLWI0MTE1MDY3NDhlNCJ9.r6bIw5FXsEIKPMwxp3MmCiVyj6k9q6oBtSb-K8JLtDb9uQ4BY2dHVQwFczdIPq1FJ_HsQNJCufHCvlY0KQrhvz2vpseqM5H2mt4BCDhUWRUMOiMurfo5wHj8E8K17_hzUIc8OWOzX_lJ62Jcb2o9EGbybCDtzAMF51yeuWyfcHodOLXuogShfhyTSZINTdUkkDED77ffZM2HZt27P5iByu-54AhEymTtUVXEoiOLb2A_cY-3nGOoXRSgpnyNm2rLFfXwIErovFx2vFZiXv7S59HM488XFMcKuWEASPQXGpLY5OCUiFxC4tod-fyKamcBZtOkFv7U9-VJNxyqBGEYC6BnN356QBu369HqHqkeE4HU3NfV9FC4nA5jNfI7ZnzAUSJWXlDijF37C-rt9NtBYzzGUEtzVOf0VU3mRrd_qSEiFvct0TrN5kZF0EOdx-2-9oVGCZXJXnGdw9Ht0coR4SU5dKH_mmGvswyCqe0jRDn7gn0JrHdFmPPJTJpSExzxqf0uVvK8ruC_a2C8z4cJ438IU9mDtMva8ceAUs6vAoN_PKWv3D30ThfLgoaMcTS0Ld9Kk1KWLuzpVXb0CPF_ZN82r8uMzezOS98kqDGCM_Rbuf7Puk3-STpNIqdMy42m2NYWCYxNO8RmOboiUgWdW-3egrUCSRIjSf8WfSfuhPs";
        try{
            let password=fs.readFileSync(__dirname+"/key_for_GlobaliD.key")
            const result = globalidCrypto.RSA.decrypt(password.toString('utf8'), "observer");
            // const tokenData = globalidCrypto.AES.decrypt(result, result);

            // const result = globalidCrypto.AES.decrypt(idToken, password);
        console.log("result",result);}
        catch(err){
            console.log("err",err);
        }
    }

    async getPIIData(codes){
        let URL=Config.GLOBAL_ID_API_URL+"auth/token";
        let headers={
            'Content-Type': 'application/json'
        };
        let data={
            "client_id": Config.GLOBAL_ID_CLIENT_ID,
            "client_secret": Config.GLOBAL_ID_CLIENT_SECRET,
            "grant_type": "authorization_code",
            "refresh_token": "string",
            "code":codes,
            "redirect_uri": Config.GLOBAL_ID_REDIRECT_URL
        }
        return await HttpService.executeHTTPRequest(httpConstants.METHOD_TYPE.GET, URL, "", data, headers);
    }

    async decryptPIIInfo(){

    }
}
