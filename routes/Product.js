const express = require("express");
const { Brand } = require("../models/Brand");
const { Product, validate } = require("../models/product");

const router = express.Router();

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const brand = await Brand.findById(req.body.Brand.value);
  if (!brand)
    return res.status(400).send("brand not found related to the given id");
  const numberInStock = req.body.Size.reduce(
    (amount, item) => item.numberInStock + amount,
    0
  );
  const price = req.body.Size.reduce(
    (amount, item) => item.price * item.numberInStock + amount,
    0
  );

  const product = new Product({
    Brand: {
      _id: brand._id,
      value: brand.value,
      label: brand.label,
    },
    productName: req.body.productName,
    NumberInStock: numberInStock,

    Price: price,

    numberOfQuantity: req.body.numberOfQuantity,
    purchasedItem: numberInStock,
    Size: req.body.Size,
  });
  await product.save();
  res.send(product);
});
router.put("/:id", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const brand = await Brand.findById(req.body.Brand.value);
  if (!brand)
    return res.status(400).send("brand not found related to the given id");
  const numberInStock = req.body.Size.reduce(
    (amount, item) => item.numberInStock + amount,
    0
  );
  const price = req.body.Size.reduce(
    (amount, item) => item.price * item.numberInStock + amount,
    0
  );

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      // title: req.body.title,
      // desc: req.body.desc,
      // postPic: req.body.postPic,
      // $set: req.body,
      $set: {
        Brand: {
          _id: brand._id,
          value: brand.value,
          label: brand.label,
        },
        productName: req.body.productName,
        NumberInStock: numberInStock,

        Size: req.body.Size,
        purchasedItem: numberInStock,
        Price: price,
      },

      // $inc: {
      //   purchasedItem: +numberInStock,
      //   Price: +price,
      // },
    },
    {
      new: true,
    }
  );
  if (!product)
    return res.status(400).send("Product not found with the given id");
  res.send(product);
});

router.get("/", async (req, res) => {
  const product = await Product.find();
  res.send(product);
});
router.get("/:id", async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(400).send("product not found");

  res.send(product);
});

router.put("/updateStock/:id", async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      NumberInStock: req.body.NumberInStock,
    },
    { new: true }
  );
  if (product.NumberInStock < 0)
    return res.status(404).send("order is not in stock");
  if (!product)
    return res.status(404).send("product not found related to the given id");
  res.send(product);
});

router.delete("/:id", async (req, res) => {
  const product = await Product.findOneAndRemove({ _id: req.params.id });
  res.send(product);
});

module.exports = router;
