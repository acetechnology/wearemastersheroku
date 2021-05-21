const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateProfileInput(data) {
  let errors = {};

  data.first_name = !isEmpty(data.first_name) ? data.first_name : "";
  data.last_name = !isEmpty(data.last_name) ? data.last_name : "";
  data.gender = !isEmpty(data.gender) ? data.gender : "";
  data.location = !isEmpty(data.location) ? data.location : "";
  data.eth_address = !isEmpty(data.eth_address) ? data.eth_address : "";
  data.youtube_url = !isEmpty(data.youtube_url) ? data.youtube_url : "";
  data.facebook_url = !isEmpty(data.facebook_url) ? data.facebook_url : "";
  data.twitter_url = !isEmpty(data.twitter_url) ? data.twitter_url : "";
  data.instagram_url = !isEmpty(data.instagram_url) ? data.instagram_url : "";

  if (Validator.isEmpty(data.first_name)) {
    errors.first_name = "First Name is required";
  }

  if (Validator.isEmpty(data.last_name)) {
    errors.last_name = "Last Name is required";
  }

  if (Validator.isEmpty(data.gender)) {
    errors.gender = "Gender is required";
  }

  if (Validator.isEmpty(data.location)) {
    errors.location = "Location is required";
  }

  if (Validator.isEmpty(data.eth_address)) {
    errors.eth_address = "Ethereum address is required";
  }

  if (!isEmpty(data.youtube_url)) {
    if (!Validator.isURL(data.youtube_url)) {
      errors.youtube_url = "Invalid URL for YouTube";
    }
  }

  if (!isEmpty(data.facebook_url)) {
    if (!Validator.isURL(data.facebook_url)) {
      errors.facebook_url = "Invalid URL for FaceBook";
    }
  }

  if (!isEmpty(data.twitter_url)) {
    if (!Validator.isURL(data.twitter_url)) {
      errors.twitter_url = "Invalid URL for Twitter";
    }
  }

  if (!isEmpty(data.instagram_url)) {
    if (!Validator.isURL(data.instagram_url)) {
      errors.instagram_url = "Invalid URL for Instagram";
    }
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
