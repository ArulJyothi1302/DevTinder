const mongoose = require("mongoose");
const conDb = async () => {
  await mongoose.connect(
    "mongodb+srv://aruljyothi0202:RIp1gYuSUUBvggsg@cluster0.iboxg.mongodb.net/devTinder"
  );
};

module.exports = conDb;
