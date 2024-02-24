const mongoose = require("mongoose");
const { brandSchema } = require("./Brand");
const Joi = require("joi");

const productSchema = new mongoose.Schema(
  {
    Brand: {
      type: brandSchema,
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    NumberInStock: {
      type: Number,
      default: 0,
    },
    Price: {
      type: Number,
      default: 0,
    },

    numberOfQuantity: {
      type: Number,
      default: 1,
    },
    purchasedItem: {
      type: Number,
      default: 1,
    },
    Size: {
      type: Array,
      default: "",
    },
  },
  { timestamps: true }
);

function validateProduct(product) {
  const Schema = {
    Brand: Joi.object({
      arg: Joi.string().valid("value", "label"),
      value: Joi.string(),
      label: Joi.string(),
    }),
    // Brand: Joi.object().required(),
    productName: Joi.string().required(),
    NumberInStock: Joi.number(),
    Price: Joi.number(),

    Size: Joi.array(),
  };
  return Joi.validate(product, Schema);
}

const Product = mongoose.model("Product", productSchema);

module.exports.Product = Product;

module.exports.validate = validateProduct;
