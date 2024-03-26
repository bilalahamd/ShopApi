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
router.put("/:id", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.send(error.details[0].message);

  const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!brand)
    return res.status(404).send("The brand with the given ID was not found.");

  res.send(brand);
});

router.delete("/:id", async (req, res) => {
  const brand = await Brand.findOneAndRemove({ _id: req.params.id });
  res.send(brand);
});

module.exports = router;
