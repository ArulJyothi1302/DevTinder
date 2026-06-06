const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URI);
    console.log("Database Connected");
  } catch (err) {
    console.error("MongoDB Error:", err);
    throw err;
  }
};

module.exports = connectDB;