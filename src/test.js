const mongoose = require("mongoose");

mongoose
  .connect(
    "mongodb+srv://aruljyothi0202:WmBcawMxl2g4ARIZ@cluster0.iboxg.mongodb.net/devTinder?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => {
    console.log("Connected");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });