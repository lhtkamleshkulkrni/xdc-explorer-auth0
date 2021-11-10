/**
 * Created by  on 18/09/20.
 */

 'use strict'
 import { httpConstants } from '../common/constants'
 
 
 export default class Utility {
     static response(res, data, message, success, code) {
         const responseObj = {
             responseData: data ? data : {},
             message: message,
             success: success,
             responseCode: code
         }
         res.format({
             json: () => {
                 res.send(responseObj)
             }
         })
     }
 
     static responseForValidation(res, errorArray, success, code = 400, message) {
         const responseObj = {
             message: message ? message : 'Invalid Request',
             errors: errorArray,
             success: success,
             responseCode: code
         }
         res.format({
             json: () => {
                 res.send(responseObj)
             }
         })
     }
 
     static handleError(err, req, res) {
         if (!res) {
             return false
         }
 
         err = err || {}
         let msg = err.message ? err.message : err
         const code = err.code ? err.code : httpConstants.RESPONSE_CODES.BAD_REQUEST
         this.response(res, {}, msg, httpConstants.RESPONSE_STATUS.FAILURE, code)
     }
 
     /**
      * This function is made to handle success and error callback!
      * @param promise
      * @returns {Promise<Promise|Bluebird<*[] | R>|Bluebird<any | R>|*|Promise<T | *[]>>}
      */
     static async parseResponse(promise) {
         return promise.then(data => {
             return [null, data]
         }).catch(err => [err])
     }
 
     /**
      * To throw error
      * @param data
      * @param message
      * @param code
      * @returns {{code: number, data: *, message: *}}
      */
     static error(data, message, code) {
         return {
             data: data,
             message: message,
             code: code
         }
     }
 
     static getFormattedDate() {
         const date = new Date()
         return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds()
     }
 
     /**
      * @param functionName
      * @param message
      * @param payload:should be in object form
      * @param developerAlias
      * @param logType ["INFO", "WARNING", "ERROR"]
      * @constructor
      */
 
     static lhtLog(functionName, message, payload, developerAlias, logType = httpConstants.LOG_LEVEL_TYPE.INFO) {
 
         const date = new Date();
         let d = date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
 
         console.log(`[ ${d} ] ${logType}: ${functionName}: ${message}: ${JSON.stringify(payload)}: Developer : ${developerAlias}`)
     }
 
     static generateRandomAlphaNumericString(length) {
         let randomAlphaNumericString = "";
         let charset = "0123456789";
         for (let index = 0; index < length; index++)
             randomAlphaNumericString += charset.charAt(Math.floor(Math.random() * charset.length));
 
         return randomAlphaNumericString;
     }
 
     static generatePass(pLength) {
         let keyListAlpha = "abcdefghijklmnopqrstuvwxyz",
             keyListInt = "123456789",
             keyListSpec = "!@#_",
             i = 0,
             password = '';
         let len = Math.ceil(pLength / 2);
         len = len - 1;
         let lenSpec = pLength - 2 * len;
 
         for (i = 0; i < len; i++) {
             password += keyListAlpha.charAt(Math.floor(Math.random() * keyListAlpha.length));
             password += keyListInt.charAt(Math.floor(Math.random() * keyListInt.length));
         }
 
         for (i = 0; i < lenSpec; i++)
             password += keyListSpec.charAt(Math.floor(Math.random() * keyListSpec.length));
 
         password = password.split('').sort(function () { return 0.5 - Math.random() }).join('');
 
         return password;
     }
 }