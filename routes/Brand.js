const express = require("express");
const { validate, Brand } = require("../models/Brand");
const router = express.Router();

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.send(error.details[0].message);

  const brand = new Brand(req.body);
  await brand.save();
  res.send(brand);
});
router.get("/", async (req, res) => {
  const brand = await Brand.find();
  res.send(brand);
});

router.delete("/:id", async (req, res) => {
  const brand = await Brand.findOneAndRemove({ _id: req.params.id });
  res.send(brand);
});

module.exports = router;
