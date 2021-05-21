const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validatePasswordInput(data) {
  let errors = {};

  data.oldPassword = !isEmpty(data.oldPassword) ? data.oldPassword : "";
  data.newPassword = !isEmpty(data.newPassword) ? data.newPassword : "";
  data.confirmPassword = !isEmpty(data.confirmPassword)
    ? data.confirmPassword
    : "";

  if (!Validator.isLength(data.oldPassword, { min: 6 })) {
    errors.oldPassword = "Old password is incorrect";
  }

  if (!Validator.isLength(data.newPassword, { min: 6 })) {
    errors.newPassword = "Password must be at least 6 characters";
  }

  if (!Validator.isLength(data.confirmPassword, { min: 6 })) {
    errors.confirmPassword = "Password must be at least 6 characters";
  }

  if (Validator.isEmpty(data.oldPassword)) {
    errors.oldPassword = "Old password is required";
  }

  if (Validator.isEmpty(data.newPassword)) {
    errors.newPassword = "New password is required";
  }

  if (Validator.isEmpty(data.confirmPassword)) {
    errors.confirmPassword = "Confirm password is required";
  }

  if (!Validator.equals(data.newPassword, data.confirmPassword)) {
    errors.confirmPassword = "New Password and Confirm Password do not match";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
