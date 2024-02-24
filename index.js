require("express-async-errors");
const winston = require("winston");
const error = require("./middleware/error");
const mongoose = require("mongoose");
const express = require("express");
const Fawn = require("fawn");
const app = express();
const product = require("./routes/Product");
const order = require("./routes/Order");
const brand = require("./routes/Brand");
const user = require("./routes/User");
const auth = require("./routes/Auth");
winston.add(winston.transports.File,{filename:'logFile.log'})

mongoose
  .connect("mongodb://localhost/shop")
  .then(() => console.log("Shop backend is Runnig"))
  .catch((err) => console.log("Connection Faild"));

Fawn.init(mongoose);

app.use(express.json());

app.use("/api/product", product);
app.use("/api/order", order);
app.use("/api/brand", brand);
app.use("/api/user", user);
app.use("/api/auth", auth);
app.use(error);

app.listen(5000, console.log("listning on port 5000"));
