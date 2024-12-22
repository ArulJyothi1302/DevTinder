const express = require("express");
const app = express();
const conDb = require("./config/database");
app.use(express.json());
const User = require("./models/user");

app.post("/signup", async (req, res) => {
  const user = new User(
    req.body
    //   {
    //   fName: "Arul",
    //   lName: "Jyothi",
    //   email: "arul@gmail.com",
    //   password: "arul1302",
    // }
  );
  try {
    user.save();
    res.send("Data Added successfully");
  } catch (err) {
    res.status(404).send("Error in saving " + err.message);
  }
});

app.get("/user", async (req, res) => {
  const userEmail = req.body.email;
  const user = await User.findOne({ email: userEmail });
  if (!user) {
    res.status(404).send("User not found");
  } else {
    res.send(user);
  }
});
app.get("/user1", async (req, res) => {
  const userId = req.body.id;
  const user = await User.findById(userId);
  if (!user) {
    res.status(404).send("User not found");
  } else {
    res.send(user);
  }
});
//Delete
app.delete("/user", async (req, res) => {
  const userId = req.body.id;
  try {
    const user = await User.findByIdAndDelete({ _id: userId });
    user
      ? res.send("Deleted Succefully")
      : res.status(404).send("No user Found ");
  } catch (err) {
    res.status(404).send("Something went Wrong");
  }
});

//Updating one record

app.patch("/user", async (req, res) => {
  const userId = req.body.id;
  const userEmail = req.body.email;
  const upData = req.body;
  // try {
  //   const user = await User.findByIdAndUpdate(userId, upData, {
  //     returnDocument: "after",
  //   });
  //   console.log(user);
  //   res.send("Updated Succefully");
  // }
  try {
    const user = await User.findOneAndUpdate({ email: userEmail }, upData, {
      returnDocument: "after",
      runValidators: true,
    });
    console.log(user);
    res.send("Updated Succefully");
  } catch (err) {
    res.status(404).send("Something Went Wrong");
  }
});

//Get all data
app.get("/feed", async (req, res) => {
  const user = await User.find({});

  user.length === 0 ? res.send(user) : res.status(404).send("User Not Found");
});
conDb()
  .then(() => {
    console.log("Db Connected Succefully");
    app.listen(7777, () => {
      console.log("Server connected to port 7777");
    });
  })
  .catch((err) => {
    console.error("Not Connected");
  });
