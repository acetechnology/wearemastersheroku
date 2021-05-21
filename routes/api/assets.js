const express = require("express");
const router = express.Router();
const passport = require("passport");
const axios = require("axios");

// Load Input Validator
const validateUploadInput = require("../../validation/upload");

// Load User Model
const User = require("../../models/User");
const Asset = require("../../models/Asset");

// @route   GET api/assets
// @desc    Get Assets
// @access  Private
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Asset.find({ user: req.user.id })
      .sort({ date: -1 })
      .then((assets) => {
        return res.status(200).json(assets);
      })
      .catch((err) => {
        res.status(404).json({ error: err });
      });
  }
);

// @route   GET api/assets/:id
// @desc    Get Asset By ID
// @access  Public
router.get("/:id", (req, res) => {
  Asset.findOne({
    token_id: req.params.id,
  })
    .then((asset) => {
      return res.status(200).json(asset);
    })
    .catch((err) => {
      console.log(err);
      res
        .status(404)
        .json({ error: `No asset found with request ID: ${req.params.id}` });
    });
});

// @route GET api/assets/register-asset
// @desc Register Asset
// @access Public
router.post("/register-asset", (req, res) => {
  const errors = {};
  //const { errors, isValid } = validateRegisterAssetInput(req.body);

  // Check Validation
  //   if (!isValid) {
  //     return res.status(400).json(errors);
  //   }

  const token_id = req.body.token_id;
  const name = req.body.name;
  const description = req.body.description;
  const price = req.body.price;
  const image = req.body.image;
  const external_url = `https://wearemasters.io/assets/${req.body.token_id}`;
  const animation_url = req.body.animation_url;
  const youtube_url = req.body.youtube_url;

  Asset.findOne({
    token_id: token_id,
  })
    .then((asset) => {
      if (asset) {
        errors.token_id = "Token ID already assigned to another asset already.";
        return res.status(404).json(errors);
      } else {
        const newAsset = new Asset();

        newAsset.token_id = token_id;
        newAsset.name = name;
        newAsset.description = description;
        newAsset.price = price;
        newAsset.image = image;
        newAsset.external_url = external_url;
        newAsset.animation_url = animation_url;
        newAsset.youtube_url = youtube_url;

        newAsset
          .save()
          .then((asset) => {
            const payload = {
              id: asset.id,
              token_id: asset.token_id,
              name: asset.name,
              description: asset.description,
              price: asset.price,
              image: asset.image,
              external_url: asset.external_url,
              animation_url: asset.animation_url,
              youtube_url: asset.youtube_url,
            };

            return res.status(200).json(payload);
          })
          .catch((err) => console.log(err));
      }
    })
    .catch((err) => console.log(err));
});

// @route GET api/assets/upload-digital-art
// @desc Upload Digital Art
// @access Private
router.post(
  "/upload-digital-art",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateUploadInput(req.body);

    // Check Validation
    if (!isValid) {
      return res.status(400).json(errors);
    }

    const user = req.user.id;
    const title = req.body.title;
    const price = req.body.price;
    const image_url = req.body.image_url;
    const animation_url = req.body.animation_url;
    const youtube_url = req.body.youtube_url;
    const facebook_url = req.body.facebook_url;
    const twitter_url = req.body.twitter_url;
    const instagram_url = req.body.instagram_url;
    const description = req.body.description;
    const posted_by = req.user.username;

    const newAsset = new Asset({
      user: user,
      name: title,
      price: price,
      image: image_url,
      animation_url: animation_url,
      youtube_url: youtube_url,
      facebook_url: facebook_url,
      twitter_url: twitter_url,
      instagram_url: instagram_url,
      description: description,
      posted_by: posted_by,
      status: "PENDING",
    });

    newAsset
      .save()
      .then((asset) => {
        const payload = {
          id: asset.id,
          name: asset.name,
          description: asset.description,
          price: asset.price,
          image: asset.image,
          animation_url: asset.animation_url,
          youtube_url: asset.youtube_url,
          facebook_url: asset.facebook_url,
          twitter_url: asset.twitter_url,
          instagram_url: asset.instagram_url,
          description: asset.description,
          status: asset.status,
        };

        return res.status(200).json(payload);
      })
      .catch((err) => console.log(err));
  }
);

// @route GET api/assets/rate/get-eth-rate
// @desc Get Current ETH Rate
// @access Private
router.get("/rate/get-eth-rate", (req, res) => {
  axios
    .get("https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD")
    .then((response) => {
      return res.json({ amount: response.data.USD });
    })
    .catch((err) => {
      console.log(err);
      res
        .status(404)
        .json({ error: "Could not process request at this time." });
    });
});

module.exports = router;
