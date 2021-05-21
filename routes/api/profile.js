const express = require("express");
const router = express.Router();
const passport = require("passport");

// Load Validation
const validateProfileInput = require("../../validation/profile");

// Load Models
const Profile = require("../../models/Profile");

// @route   GET api/profile
// @desc    Get current user profile
// @access  Private
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};

    Profile.findOne({ user: req.user.id })
      .then((profile) => {
        if (!profile) {
          errors.noProfile = "There is no profile for this user";
          return res.status(404).json(errors);
        }
        res.status(200).json(profile);
      })
      .catch((err) => res.status(404).json(err));
  }
);

// @route   GET api/profile/all
// @desc    Get all profiles
// @access  Public
router.get("/all", (req, res) => {
  const errors = {};

  Profile.find()
    .populate("user", ["username"])
    .then((profiles) => {
      if (!profiles) {
        errors.noprofile = "There are no profiles";
        return res.status(404).json(errors);
      }

      res.json(profiles);
    })
    .catch((err) => res.status(404).json({ profile: "There are no profiles" }));
});

// @route   GET api/profile/handle/:handle
// @desc    Get profile by handle
// @access  Public
router.get("/username/:username", (req, res) => {
  const errors = {};

  Profile.findOne({ handle: req.params.handle })
    .populate("user", ["username"])
    .then((profile) => {
      if (!profile) {
        errors.noprofile = "There is no profile for this user";
        res.status(404).json(errors);
      }

      res.json(profile);
    })
    .catch((err) => res.status(404).json(err));
});

// @route   GET api/profile/user/:user_id
// @desc    Get profile by user ID
// @access  Public
router.get("/user/:user_id", (req, res) => {
  const errors = {};

  Profile.findOne({ user: req.params.user_id })
    .populate("user", ["username"])
    .then((profile) => {
      if (!profile) {
        errors.noprofile = "There is no profile for this user";
        res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch((err) =>
      res.status(404).json({ profile: "There is no profile for this user" })
    );
});

// @route   POST api/profile
// @desc    Update User Profile
// @access  Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateProfileInput(req.body);

    // Check Validation
    if (!isValid) {
      // Return any errors with 400 status
      return res.status(400).json(errors);
    }

    // Get fields
    const profileFields = {};
    profileFields.user = req.user.id;
    if (req.body.first_name) profileFields.first_name = req.body.first_name;
    if (req.body.last_name) profileFields.last_name = req.body.last_name;
    if (req.body.gender) profileFields.gender = req.body.gender;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.eth_address) profileFields.eth_address = req.body.eth_address;
    if (req.body.bio) profileFields.bio = req.body.bio;

    // Social
    profileFields.social = {};
    if (req.body.youtube_url)
      profileFields.social.youtube_url = req.body.youtube_url;
    if (req.body.twitter_url)
      profileFields.social.twitter_url = req.body.twitter_url;
    if (req.body.facebook_url)
      profileFields.social.facebook_url = req.body.facebook_url;
    if (req.body.instagram_url)
      profileFields.social.instagram_url = req.body.instagram_url;

    Profile.findOne({ user: req.user.id })
      .then((profile) => {
        if (profile) {
          // Update
          Profile.findOneAndUpdate(
            { user: req.user.id },
            { $set: profileFields },
            { new: true }
          ).then((profile) => res.json(profile));
        } else {
          // Create

          // Save Profile
          new Profile(profileFields)
            .save()
            .then((profile) => res.json(profile));
        }
      })
      .catch((e) => {
        console.log(e);
        errors.message = "Could not process your request at this time";
        res.status(404).json({ error: errors });
      });
  }
);

module.exports = router;
