const mongoose = require("mongoose");
const Joi = require("joi");

const brandSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true,
  },
});

const Brand = mongoose.model("Brand", brandSchema);

function validateBrand(brand) {
  const Schema = {
    label: Joi.string().required(),
  };
  return Joi.validate(brand, Schema);
}

module.exports.Brand = Brand;
module.exports.brandSchema = brandSchema;
module.exports.validate = validateBrand;
