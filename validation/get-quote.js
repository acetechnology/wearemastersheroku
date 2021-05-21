const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateQuoteInput(data) {
  let errors = {};

  data.packageWeight = !isEmpty(data.packageWeight) ? data.packageWeight : "";
  data.pickupType = !isEmpty(data.pickupType) ? data.pickupType : "";
  data.originCity = !isEmpty(data.originCity) ? data.originCity : "";
  data.destinationCity = !isEmpty(data.destinationCity)
    ? data.destinationCity
    : "";

  if (Validator.isEmpty(data.packageWeight)) {
    errors.packageWeight = "Package Weight is required";
  }

  if (Validator.isEmpty(data.pickupType)) {
    errors.pickupType = "Pickup Type is required";
  }

  if (Validator.isEmpty(data.originCity)) {
    errors.originCity = "Origin City is required";
  }

  if (Validator.isEmpty(data.destinationCity)) {
    errors.destinationCity = "Destinition City is required";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
