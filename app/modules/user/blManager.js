import UserSchema from "../../models/user";
import { AdminRoles, Consents, apiFailureMessage, apiSuccessMessage, Auth0RoleNameConstants, emailTitles, genericConstants, httpConstants, portalType, statusConstant, statusConstants } from "../../common/constants";
import Utils from "../../utils";
import AuthBLManager from "../auth0/manager";


export default class BlManager {
async updateUser(request) {
    try {
      if (!request || !request.userId)
        throw Utils.error({}, apiFailureMessage.INVALID_PARAMS, httpConstants.RESPONSE_CODES.FORBIDDEN);
      let user = await UserSchema.findOne({ userId: request.userId })
      if (!user) {
        throw apiFailureMessage.USER_NOT_EXISTS
      }
      let updateObj = {
        ...user._doc,
        modifiedOn: new Date().getTime()
      }
      let auth0Req = {}
      
      if (request.name) {
        auth0Req['given_name'] = request.name
        auth0Req['name'] = request.name
        updateObj['userName'] = request.name
      }
      if (request.profilePic)
        updateObj['profilePic'] = request.profilePic

      

      

      if (auth0Req && Object.keys(auth0Req) && Object.keys(auth0Req).length) {
        auth0Req['userId'] = request.userId //`auth0|${request.userId}`
        await new AuthBLManager().updateUser(auth0Req)
      }

      return UserSchema.findOneAndUpdate({
        userId: request.userId
      }, {
        $set: { ...updateObj }
      }, { new: true });
    } catch (error) {
      throw error
    }
  }
  async changeEmail(request) {
    try {
      let user = await UserSchema.findOne({ userId: request.userId });
      if (!user) {
        throw apiFailureMessage.USER_NOT_EXISTS
      }
      if (user.otpAccountVerified !== request.otp)
        throw apiFailureMessage.WRONG_OTP;
      await new AuthBLManager().changeEmail({
        email: request.newEmail,
        userId: `auth0|${request.userId}`
      })
      await UserSchema.findOneAndUpdate({ userId: request.userId }, { email: request.newEmail });
      return {
        message: `Your email has been updated successfully`
      }
    } catch (error) {
      throw error
    }
  }
}