const mongoose = require("mongoose");
const conDb = async () => {
  await mongoose.connect(process.env.DB_URI);
};

module.exports = conDb;
