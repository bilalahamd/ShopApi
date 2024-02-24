const express = require("express");
const { Order, validate } = require("../models/order");
const { Product } = require("../models/product");
const mongoose = require("mongoose");
const _ = require("lodash");
const { v4: uuidv4 } = require("uuid");
const router = express.Router();
const Fawn = require("fawn");
const serialNumber = uuidv4();
const date = new Date();

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.send(error.details[0].message);
  let order = await Order.findOne({ username: req.body.username });
  if (order) return res.status(400).send("Already have Account!");
  let bilal = req.body.product;
  let productarray = {
    date: date,
    serialNumber: uuidv4(),
    totalPrice: req.body.TotalPrice,
    RecivedPrice: req.body.RecivedPrice,
    // orderNo: req.body.orderno,
    invoice_number: req.body.invoice_number,
  };
  bilal.push(productarray);

  order = new Order({
    invoice_number: req.body.invoice_number,
    username: req.body.username,

    // product: [req.body.product],
    product: [bilal],

    TotalPrice: req.body.TotalPrice,
    RecivedPrice: req.body.RecivedPrice,
    RemainingPrice: req.body.TotalPrice - req.body.RecivedPrice,
  });
  // await order.save();
  // res.send(order);

  try {
    let task = new Fawn.Task();
    task = task.save("orders", order);
    //practice code

    order.product?.forEach(async (singleProduct) => {
      // req.body.product.forEach(async (item) => {
      singleProduct?.forEach(async (item) => {
        item.rahid?.forEach(async (s, index) => {
          task = task.update(
            "products",

            {
              _id: mongoose.Types.ObjectId(item.id),
              "Size.value": s.value,
            },
            {
              $inc: {
                "Size.$.numberInStock": -s.numberOfQuantity,
                NumberInStock: -s.numberOfQuantity,
              },
            }
          );
        });
      });
    });

    task.run();
    res.send(order);
  } catch (ex) {
    res.status(500).send("Something failed");
  }
});
router.put("/addobject/:id", async (req, res) => {
  let bilal = req.body.product;
  let productarray = {
    date: date,
    serialNumber: uuidv4(),
    totalPrice: req.body.TotalPrice,
    RecivedPrice: req.body.RecivedPrice,
    invoice_number: req.body.invoice_number,
  };
  bilal.push(productarray);
  let order = await Order.findOneAndUpdate(
    { _id: req.params.id },

    {
      $inc: {
        TotalPrice: +req.body.TotalPrice,
        RecivedPrice: +req.body.RecivedPrice,
        RemainingPrice: +(req.body.TotalPrice - req.body.RecivedPrice),
      },
      $push: { product: bilal },
    },
    { new: true }
  );

  try {
    let task = new Fawn.Task();
    req.body.product?.forEach(async (singleProduct) => {
      singleProduct.rahid?.forEach(async (s, index) => {
        task = task.update(
          "products",

          {
            _id: mongoose.Types.ObjectId(singleProduct.id),
            "Size.value": s.value,
          },
          {
            $inc: {
              "Size.$.numberInStock": -s.numberOfQuantity,
              NumberInStock: -s.numberOfQuantity,
            },
          }
        );
      });
    });

    task.run();
    res.send(order);
  } catch (ex) {
    res.status(500).send("Something failed");
  }
});

router.put("/restoreProduct/:id", async (req, res) => {
  const bilal = parseInt(req.body.index);

  const order = await Order.findOneAndUpdate(
    { _id: req.params.id },

    {
      $pull: {
        [`product.${bilal}`]: { id: { $eq: req.body.id } },
      },
    },

    {
      new: true,
    }
  );
  try {
    let task = new Fawn.Task();

    req.body.array.rahid?.forEach(async (s, index) => {
      task = task.update(
        "products",

        {
          _id: mongoose.Types.ObjectId(req.body.id),
          "Size.value": s.value,
        },
        {
          $inc: {
            "Size.$.numberInStock": s.numberOfQuantity,
            NumberInStock: s.numberOfQuantity,
          },
        }
      );
    });

    task.run();
    res.send(order);
  } catch (ex) {
    res.status(500).send("Something failed");
  }
});
//remove size
router.put("/restoreSize/:id", async (req, res) => {
  const bilal = parseInt(req.body.index);

  const order = await Order.findOneAndUpdate(
    { _id: req.params.id },

    {
      $pull: {
        // "product.$[].$[elment1].rahid": { value: { $eq: req.body.value } },
        [`product.${bilal}.$[elment1].rahid`]: {
          value: { $eq: req.body.value },
        },
      },
    },
    {
      new: true,
      arrayFilters: [
        {
          "elment1.id": req.body.id,
          // "elment1.serialNumber": req.body.serialNumber,
        },
        // { "element2.value": req.body.value },
      ],
    }
  );
  try {
    let task = new Fawn.Task();

    task = task.update(
      "products",

      {
        _id: mongoose.Types.ObjectId(req.body.id),
        "Size.value": req.body.value,
      },
      {
        $inc: {
          "Size.$.numberInStock": req.body.quantity,
          NumberInStock: req.body.quantity,
        },
      }
    );

    task.run();
    res.send(order);
  } catch (ex) {
    res.status(500).send("Something failed");
  }
});
//update number ofQuanity
router.put("/updatedQuantity/", async (req, res) => {
  const quantity = req.body.numberOfQuantity;
  const url = req.body.url;
  const sizeId = req.body._id;
  const bilal = req.body.index;

  let order = await Order.findOneAndUpdate(
    { _id: url },
    {
      // $set: {
      //   "product.$[].$[elment1].rahid.$[element2].numberOfQuantity": quantity,
      // },
      $set: {
        // "product.$[].$[elment1].rahid": { value: { $eq: req.body.value } },
        [`product.${bilal}.$[elment1].rahid.$[element2].numberOfQuantity`]:
          quantity,
      },
    },
    {
      new: true,
      arrayFilters: [
        {
          "elment1.id": req.body.id,
          "elment1.serialNumber": req.body.serialNumber,
        },
        { "element2.value": sizeId },
      ],
    }
  );
  try {
    let task = new Fawn.Task();

    task = task.update(
      "products",

      {
        _id: mongoose.Types.ObjectId(req.body.id),
        "Size.value": sizeId,
      },
      {
        $inc: {
          "Size.$.numberInStock": -req.body.updatedQuantity,
          NumberInStock: -req.body.updatedQuantity,
        },
      }
    );

    task.run();
    res.send(order);
  } catch (ex) {
    res.status(500).send("Something failed");
  }
});

//actual api
router.get("/orderDetail/:id", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(404).send("invalid id");
  const order = await Order.findById(req.params.id);
  if (!order)
    return res.status(404).send("no order found related to the given id");

  res.send(order);
});

router.get("/date/states", async (req, res) => {
  const date = new Date();

  const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));
  try {
    const data = await Order.aggregate([
      { $match: { orerDate: { $gte: lastYear } } },
      {
        $project: {
          month: { $month: "$orerDate" },
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 },
        },
      },
    ]);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});
router.get("/currentMonth/:id", async (req, res) => {
  const data = await Order.find({
    $expr: { $eq: [{ $month: "$orerDate" }, parseInt(req.params.id)] },
  });

  res.status(200).json(data);
});

// get monthly
router.get("/rahid/bilal", async (req, res) => {
  const date = new Date();

  const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
  const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));

  try {
    const order = await Order.aggregate([
      { $unwind: "$product" },

      {
        $project: {
          items: {
            $filter: {
              input: "$product",
              as: "item",
              cond: { $ne: ["$$item.id", -7] },
            },
          },
          dateData: {
            $filter: {
              input: "$product",
              as: "data",
              cond: { $gte: ["$$data.date", previousMonth] },
            },
          },
        },
      },
      { $unwind: "$items" },
      { $unwind: "$items.rahid" },

      { $unwind: "$dateData" },
      {
        $project: {
          month: { $month: "$dateData.date" },

          // product: "$items.rahid.price",
          // qunatity: "$items.rahid.numberOfQuantity",
          total: {
            $multiply: ["$items.rahid.price", "$items.rahid.numberOfQuantity"],
          },
        },
      },

      {
        $group: {
          _id: "$month",
          // total: "$total",

          total: { $sum: "$total" },
          // //total: { $sum: "$product" },
          // total: { $multiply: ["$product", "$quantity"] },
          // total: { $push: "$items" },
        },
      },
    ]);
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/", async (req, res) => {
  const order = await Order.find().limit(10).sort({ orerDate: -1 });
  res.send(order);
});
//all orders
router.get("/get/allorders/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (id === 0) {
    const orders = await Order.find();
    res.send(orders);
  } else {
    const order = await Order.find({
      $expr: {
        $eq: [{ $month: "$orerDate" }, id],
      },
    });
    res.send(order);
  }
});
router.get("/product/:productId", async (req, res) => {
  const product = await Order.find({
    "brand._id": req.params.productId,
  });
  res.send(product);
});

router.get("/productDetail/:productid", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.productid))
    return res.status(404).send("invalid product id");
  const date = new Date();

  const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));
  const bilal = lastYear.toJSON;

  try {
    const order = await Order.aggregate([
      { $unwind: "$product" },

      {
        $project: {
          items: {
            $filter: {
              input: "$product",
              as: "item",
              cond: { $eq: ["$$item.id", req.params.productid] },
            },
          },
          dateData: {
            $filter: {
              input: "$product",
              as: "data",
              cond: { $gt: ["$$data.date", "$bilal"] },
            },
          },
        },
      },
      { $unwind: "$items" },

      { $unwind: "$dateData" },
      {
        $project: {
          month: { $month: "$dateData.date" },

          product: "$items.rahid",
        },
      },

      {
        $group: {
          _id: "$month",

          total: { $push: "$product" },
          // total: { $push: "$items" },
        },
      },
    ]);
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json(err);
  }
});
// router.get("/product/:productId", async (req, res) => {
//   const date = new Date();

//   const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));
//   try {
//     const data = await Order.aggregate([
//       {
//         $project: {
//           adjustedGrades: {
//             $map: {
//               input: "$product",
//               as: "product",
//               in: { $eq: ["$$product", req.params.productId] },
//             },
//           },
//         },
//       },
//     ]);
//     res.status(200).json(data);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

router.put("/:id", async (req, res) => {
  let order = await Order.findOneAndUpdate(
    { _id: req.params.id },
    {
      $set: {
        "product.$[].$[elment1].RecivedPrice": req.body.RecivedPrice,
        "product.$[].$[elment1].remainingPrice": req.body.RemainingPrice,
      },
    },

    {
      new: true,
      arrayFilters: [
        {
          "elment1.serialNumber": req.body.serialNumber,
          // "elment1.date": req.body.orderDate,
        },
      ],
    }
  );
  res.status(200).json(order);
});
//order single product updation
router.put("/singleProductUpdation/:id", async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        "product.$[].$[elment1].RecivedPrice": req.body.RecivedPrice,
      },
    },

    {
      new: true,
      arrayFilters: [{ "elment1.serialNumber": req.body.serialNumber }],
    }
  );
  res.status(200).json(order);
});
//single prduct deletion

router.put("/singleProduct/:id", async (req, res) => {
  // const order = await Order.findOneAndUpdate(
  //   { _id: req.params.id },
  //   { $pull: { product: { id: req.body.singleProductId } } },
  //   { new: true }
  // );
  // let order = await Order.findOne({ _id: req.params.id });
  // if (!order)
  //   return res.status(404).send("no order found related to the given id");

  let order = await Order.findById(req.params.id);
  if (!order) return;
  const index = req.body.index;
  let newArray = [...order.product];
  newArray.splice(index, 1);
  order.product = newArray;

  await order.save();
  res.send(order);
});

//delete order
router.delete("/deleteOrder/:id", async (req, res) => {
  const order = await Order.findOneAndRemove({ _id: req.params.id });
  res.send(order);
});

module.exports = router;
// // console.log(order);
// const order = await Order.findByIdAndUpdate(
//   req.params.id,
//   {
//     RecivedPrice: req.body.RecivedPrice,
//     RemainingPrice: req.body.RemainingPrice,
//   },
//   { new: true }
// );
// if (!order)
//   return res.status(404).send("order not found related to the given id");
// res.send(order);
