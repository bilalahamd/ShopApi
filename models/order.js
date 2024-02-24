const mongoose = require("mongoose");
const Joi = require("joi");

// Joi.objectId = require("joi-objectid")(Joi);
const orderSchema = new mongoose.Schema({
  invoice_number: {
    type: String,
    required: true,
  },
  username: {
    type: String,
  },
  product: {
    type: Array,
    required: true,
    default: "",
  },

  TotalPrice: {
    type: Number,
    required: true,
  },
  RecivedPrice: {
    type: Number,
    required: true,
  },
  RemainingPrice: {
    type: Number,
    default: "",
  },
  orerDate: {
    type: Date,
    required: true,
    default: Date.now(),
  },
});

function validateOrder(order) {
  const schema = {
    invoice_number: Joi.string().required(),
    username: Joi.string(),
    product: Joi.array(),
    TotalPrice: Joi.number().required(),
    RecivedPrice: Joi.number().required(),
    RemainingPrice: Joi.number(),
  };

  return Joi.validate(order, schema);
}
const Order = mongoose.model("Order", orderSchema);

module.exports.Order = Order;
module.exports.validate = validateOrder;
