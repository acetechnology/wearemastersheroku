const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const AssetSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
  token_id: {
    type: Number,
  },
  contract_address: {
    type: String,
  },
  name: {
    type: String,
  },
  description: {
    type: String,
  },
  price: {
    type: Number,
  },
  image: {
    type: String,
  },
  image_data: {
    type: String,
  },
  external_url: {
    type: String,
  },
  attributes: [
    {
      trait_type: {
        type: String,
      },
      value: {
        type: String,
      },
      description: {
        type: String,
      },
    },
  ],
  background_color: {
    type: String,
  },
  animation_url: {
    type: String,
  },
  youtube_url: {
    type: String,
  },
  facebook_url: {
    type: String,
  },
  twitter_url: {
    type: String,
  },
  instagram_url: {
    type: String,
  },
  posted_by: {
    type: String,
  },
  status: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = Asset = mongoose.model("assets", AssetSchema);
