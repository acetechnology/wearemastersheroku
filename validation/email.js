const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateEmailInput(data) {
  let errors = {};

  data.email = !isEmpty(data.email) ? data.email : "";

  if (!Validator.isEmail(data.email)) {
    errors.email = "Invalid email address";
  }

  if (Validator.isEmpty(data.email)) {
    errors.email = "Email address is required";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
