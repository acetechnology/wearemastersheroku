const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateUploadInput(data) {
  let errors = {};

  data.title = !isEmpty(data.title) ? data.title : "";
  data.price = !isEmpty(data.price) ? data.price : "";
  data.image_url = !isEmpty(data.image_url) ? data.image_url : "";
  data.animation_url = !isEmpty(data.animation_url) ? data.animation_url : "";
  data.youtube_url = !isEmpty(data.youtube_url) ? data.youtube_url : "";
  data.facebook_url = !isEmpty(data.facebook_url) ? data.facebook_url : "";
  data.twitter_url = !isEmpty(data.twitter_url) ? data.twitter_url : "";
  data.instagram_url = !isEmpty(data.instagram_url) ? data.instagram_url : "";
  data.description = !isEmpty(data.description) ? data.description : "";

  if (Validator.isEmpty(data.title)) {
    errors.title = "Title/Name for Digital Art is required";
  }

  if (Validator.isEmpty(data.price)) {
    errors.price = "Price for the Digital Art is required";
  }

  if (Validator.isEmpty(data.image_url)) {
    errors.image_url = "Digital Art Image is required for upload";
  }

  if (!isEmpty(data.image_url)) {
    if (!Validator.isURL(data.image_url)) {
      errors.image_url = "Invalid URL for Image Upload";
    }
  }

  if (!isEmpty(data.animation_url)) {
    if (!Validator.isURL(data.animation_url)) {
      errors.animation_url = "Invalid URL for Animation";
    }
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

  if (!Validator.isLength(data.description, { min: 100 })) {
    errors.description = "Description must be above 100 characters";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
