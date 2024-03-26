const mongoose = require("mongoose");
const config = require("config");
module.exports = function () {
  mongoose
    .connect(config.get("db"))
    .then(() => console.log("Shop backend is running"))
    .catch((err) => console.log("Connection failed:", err));
};
