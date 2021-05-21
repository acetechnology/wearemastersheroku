const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateResetPasswordInput(data) {
  let errors = {};

  data.newPassword = !isEmpty(data.newPassword) ? data.newPassword : "";
  data.confirmPassword = !isEmpty(data.confirmPassword)
    ? data.confirmPassword
    : "";

  if (!Validator.isLength(data.newPassword, { min: 6, max: 30 })) {
    errors.newPassword = "New password must be at least 6 characters";
  }

  if (Validator.isEmpty(data.newPassword)) {
    errors.newPassword = "New password field is required";
  }

  if (Validator.isEmpty(data.confirmPassword)) {
    errors.confirmPassword = "Confirm Password field is required";
  }

  if (!Validator.equals(data.newPassword, data.confirmPassword)) {
    errors.newPassword = "New Password & confirm Password do not match";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
