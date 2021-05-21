const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const passport = require("passport");
const crypto = require("crypto");
const postmark = require("postmark");
const randomize = require("randomatic");

// Load Input Validator
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");
const validateEmailInput = require("../../validation/email");
const validatePasswordInput = require("../../validation/password");
const validateResetPasswordInput = require("../../validation/reset-password");

// Load User Model
const User = require("../../models/User");
const Profile = require("../../models/Profile");
const PasswordToken = require("../../models/PasswordToken");
const VerificationToken = require("../../models/VerificationToken");

// @route GET api/users/register
// @desc Register User
// @access Public
router.post("/register", (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  // Check Validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ username: new RegExp(`^${username}$`, "i") }).then((user) => {
    if (user) {
      errors.username = "Username is already in use";
      return res.status(404).json(errors);
    } else {
      User.findOne({ email: email }).then((user) => {
        if (user) {
          errors.email = "Email address already in use";
          return res.status(404).json(errors);
        } else {
          const newUser = new User({
            username: username,
            email: email,
            password: password,
          });

          bcrypt.genSalt(10, (err, salt) => {
            if (err) throw err;
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) throw err;
              newUser.password = hash;
              newUser
                .save()
                .then((user) => {
                  // Set up initial Profile
                  const profileFields = {};
                  profileFields.user = user.id;
                  profileFields.username = user.username;

                  new Profile({
                    user: user.id,
                    username: user.username,
                  }).save();

                  const payload = {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    isVerified: user.isVerified,
                  };

                  let verificationToken = new VerificationToken({
                    _userId: user._id,
                    token: randomize("0", 6),
                  });

                  verificationToken.save(function (err) {
                    if (err) {
                      return res.status(500).send({ msg: err.message });
                    }

                    let client = new postmark.ServerClient(
                      "cea34456-4cd3-4679-b3eb-495077de1a4f"
                    );

                    client.sendEmailWithTemplate(
                      {
                        From: "WeAreMasters <noreply@wearemasters.io>",
                        To: user.email,
                        TemplateId: 23303609,
                        TemplateModel: {
                          product_name: "WEAREMASTERS.IO",
                          name: user.username,
                          token: verificationToken.token,
                          company_name: "WEAREMASTERS.IO",
                        },
                      },
                      function (err) {
                        if (err) {
                          console.log(err);
                          return res.status(404).json(err);
                        }
                        jwt.sign(
                          payload,
                          keys.secretOrKey,
                          { expiresIn: 3600 },
                          (err, token) => {
                            if (err) throw err;
                            res.json({
                              success: true,
                              token: "Bearer " + token,
                            });
                          }
                        );
                      }
                    );
                  });
                })
                .catch((err) => console.log(err));
            });
          });
        }
      });
    }
  });
});

// @route GET api/users/login
// @desc Login User / Returning JWT Token
// @access Public
router.post("/login", (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);

  // Check Validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const email = req.body.email.trim();
  const password = req.body.password.trim();

  User.findOne({ email }).then((user) => {
    if (!user) {
      errors.password = "Invalid email address or password";
      return res.status(404).json(errors);
    }

    // Check Password
    bcrypt
      .compare(password, user.password)
      .then((isMatch) => {
        if (isMatch) {
          const payload = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
          };

          // Sign Token
          jwt.sign(
            payload,
            keys.secretOrKey,
            { expiresIn: 3600 },
            (err, token) => {
              if (err) throw err;
              res.json({
                success: true,
                token: "Bearer " + token,
              });
            }
          );
        } else {
          errors.password = "Invalid email address or password";
          return res.status(400).json(errors);
        }
      })
      .catch((error) => res.status(404).json(error));
  });
});

// @route   POST api/users/activate-activate
// @desc    Activate Account
// @access  Public
router.post("/activate-account/", (req, res) => {
  const errors = {};
  const messages = {};

  const token = req.body.code;

  console.log(token);

  VerificationToken.findOne({ token: token }).then((token) => {
    if (!token) {
      errors.verification =
        "We could not verify your account bacause your verification code has expired or is invalid.";
      return res.status(404).json(errors);
    }

    User.findOne({ _id: token._userId }, function (err, user) {
      if (err) {
        errors.verification = err.message;
        return res.status(400).json(errors);
      }

      if (!user) {
        errors.verification =
          "We were unable to find a user for this verification code.";
        return res.status(400).json(errors);
      }

      if (user.isVerified) {
        messages.verification =
          "We have successfully verified your account. Kindly proceed to Login.";
        return res.status(200).json(messages);
      }

      user.isVerified = true;

      user.save(function (err) {
        if (err) {
          errors.verification = err.message;
          return res.status(400).json(errors);
        }

        messages.verification =
          "We have successfully verified your account. Kindly proceed to Login";
        return res.status(200).json(messages);
      });
    });
  });
});

// @route POST api/users/resend-activation-link
// @desc Resend Activation Link
// @access Public
router.post(
  "/resend-activation-token",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    User.findOne({ email: req.user.email }).then((user) => {
      if (!user) {
        errors.email = "We could not find an account for this email address.";
        return res.status(400).json(errors);
      }

      if (user.isVerified) {
        errors.email =
          "Your account have been verified. Kindly proceed to log in.";
        return res.status(400).json(errors);
      }

      let verificationToken = new VerificationToken({
        _userId: user._id,
        token: randomize("0", 6),
      });

      verificationToken.save(function (err) {
        if (err) {
          return res.status(500).send({ msg: err.message });
        }

        let client = new postmark.ServerClient(
          "cea34456-4cd3-4679-b3eb-495077de1a4f"
        );

        client.sendEmailWithTemplate(
          {
            From: "WeAreMasters <noreply@wearemasters.io>",
            To: user.email,
            TemplateId: 23303609,
            TemplateModel: {
              product_name: "WEAREMASTERS.IO",
              name: user.username,
              code: verificationToken.token,
              company_name: "WEAREMASTERS.IO",
            },
          },
          function (err) {
            if (err) {
              console.log(err);
              return res.status(404).json(err);
            }

            return res.status(200).json({
              msg:
                "We sent you an email activation link. Proceed to activate your email address.",
            });
          }
        );
      });
    });
  }
);

// @route   POST api/users/forgot-password
// @desc    Forgot Password
// @access  Public
router.post("/forgot-password", (req, res) => {
  const { errors, isValid } = validateEmailInput(req.body);

  // Check Validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const email = req.body.email;

  User.findOne({ email: email }).then((user) => {
    if (!user) {
      errors.email =
        "We were unable to find an account for this email address.";
      return res.status(400).json(errors);
    }

    PasswordToken.findOne({ _userId: user._id }).then((password) => {
      if (password) {
        errors.email =
          "A password reset link was sent a moment ago to your email address.";
        return res.status(400).json(errors);
      }

      let passwordToken = new PasswordToken({
        _userId: user._id,
        token: crypto.randomBytes(20).toString("hex"),
      });

      passwordToken.save(function (err) {
        if (err) {
          return res.status(500).send({ msg: err.message });
        }

        let client = new postmark.ServerClient(
          "6a83c09f-bc64-4822-8b2b-c3843d4fe54f"
        );

        client.sendEmailWithTemplate(
          {
            From: "CrypTeller Digital <noreply@crypteller.com>",
            To: user.email,
            TemplateId: 18773915,
            TemplateModel: {
              product_name: "CrypTeller.com",
              name: user.username,
              action_url:
                "https://www.crypteller.com/reset-password/" +
                passwordToken.token,
              company_name: "ECOLON LIMITED",
              company_address:
                "11, Richard Okerike Close, Praise-Hill Estate, Arepo, Ogun, Nigeria.",
            },
          },
          function (err) {
            if (!err) {
              return res.json({
                msg:
                  "A password reset link have been sent to your email address.",
              });
            } else {
              return res.status(404).json(err);
            }
          }
        );
      });
    });
  });
});

// @route   POST api/users/reset-password
// @desc    Reset Password
// @access  Public
router.post("/reset-password", (req, res) => {
  const { errors, isValid } = validateResetPasswordInput(req.body);

  // Check Validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const token = req.body.token;
  const newPassword = req.body.newPassword;

  PasswordToken.findOne({ token: token }).then((token) => {
    if (!token) {
      errors.newPassword = "Your password reset link is expired";
      return res.status(400).json(errors);
    }

    User.findOne({ _id: token._userId }, (err, user) => {
      if (err) {
        return res.status(500).send({ msg: err.message });
      }

      if (!user) {
        errors.newPassword =
          "We were unable to find an account for this password reset link.";
        return res.status(400).json(errors);
      }

      bcrypt.genSalt(10, (err, salt) => {
        if (err) {
          console.log(err);
        }

        bcrypt.hash(newPassword, salt, (err, hash) => {
          if (err) throw err;
          user.password = hash;
          user
            .save()
            .then(() => {
              return res.status(200).json({
                msg:
                  "Your password reset was successful. Kindly proceed to login with your new password.",
              });
            })
            .catch((err) => res.status(404).json(err));
        });
      });
    });
  });
});

// @route GET api/users/current
// @desc Return Current User
// @access Private
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
    });
  }
);

module.exports = router;
