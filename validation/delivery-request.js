const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateQuoteInput(data) {
  let errors = {};

  data.orderNo = !isEmpty(data.orderNo) ? data.orderNo : "";
  data.description = !isEmpty(data.description) ? data.description : "";
  data.weight = !isEmpty(data.weight) ? data.weight : "";

  data.senderName = !isEmpty(data.senderName) ? data.senderName : "";
  data.senderCity = !isEmpty(data.senderCity) ? data.senderCity : "";
  data.senderTownID = !isEmpty(data.senderTownID) ? data.senderTownID : "";
  data.senderAddress = !isEmpty(data.senderAddress) ? data.senderAddress : "";
  data.senderPhone = !isEmpty(data.senderPhone) ? data.senderPhone : "";
  data.senderEmail = !isEmpty(data.senderEmail) ? data.senderEmail : "";

  if (Validator.isEmpty(data.orderNumber)) {
    errors.orderNumber = "Order Number is required";
  }

  if (Validator.isEmpty(data.description)) {
    errors.description = "Pickup Type is required";
  }

  if (Validator.isEmpty(data.weight)) {
    errors.weight = "Weight is required";
  }

  if (Validator.isEmpty(data.senderName)) {
    errors.senderName = "Sender Name is required";
  }

  if (Validator.isEmpty(data.senderCity)) {
    errors.senderCity = "Sender City is required";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
