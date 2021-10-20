import Utils from "../app/utils";
import * as yup from "yup";

module.exports = {
  validateUserLogin: async (req, res, next) => {
    const schema = yup.object().shape({
      email: yup.string().email(),
      password: yup.string().min(8).required(),
    });
    await validate(schema, req.body, res, next);
  },

  validateSignUp: async (req, res, next) => {
    const schema = yup.object().shape({
      email: yup.string().required(),
      password: yup
        .string()
        .required()
        .matches("^(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$"),
    });
    await validate(schema, req.body, res, next);
  }
};

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












