import Utils from "../app/utils";
import * as yup from "yup";

module.exports = {
  validateUserLogin: async (req, res, next) => {
    const schema = yup.object().shape({
      email: yup.string().email(),
      password: yup.string().min(8).required()
    })
    await validate(schema, req.body, res, next)
  },
  validateAddUserCookies: async (req, res, next)=>{
    const schema = yup.object().shape({
      userId: yup.string().required(),
      cookiesAllowed: yup.array().required()
    })
    await validate(schema, req.body, res, next)
  },
  validateEmail: async (req, res, next) => {
    const schema = yup.object().shape({
      email: yup.string().email().required(),
    });
    await validate(schema, req.body, res, next);
  },
  validatePrivacyConsent: async (req, res, next) => {
    const schema = yup.object().shape({
      userId: yup.string().required(),
      privacyConsent: yup.boolean().required()
    });
    await validate(schema, req.body, res, next);
  },
}

const validate = async (schema, reqData, res, next) => {
  try {
    await schema.validate(reqData, { abortEarly: false });
    next();
  } catch (e) {
    const errors = e.inner.map(({ path, message, value }) => ({
      path,
      message,
      value,
    }));
    Utils.responseForValidation(res, errors);
  }
};












