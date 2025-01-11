const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();

const cors = require("cors");
const conDb = require("./config/database");

const authRouter = require("./router/authroute");
const profileRoute = require("./router/profileroute");
const reqRoute = require("./router/reqroute");
const feedRoute = require("./router/feedRoute");
const userRoute = require("./router/userRoute");

app.use(
  cors({
    origin: "http://localhost:5173/login/",
    credentials: true,
  })
); //
app.use(express.json());

app.use(cookieParser());
const User = require("./models/user");

app.use("/", authRouter);
app.use("/", profileRoute);
app.use("/", feedRoute);
app.use("/", reqRoute);
app.use("/", userRoute);
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
app.patch("/user/:id", async (req, res) => {
  const userId = req.params?.id;
  // const userEmail = req.body.email;
  const upData = req.body;
  // try {
  //   const user = await User.findByIdAndUpdate(userId, upData, {
  //     returnDocument: "after",
  //   });
  //   console.log(user);
  //   res.send("Updated Succefully");
  // }
  try {
    const ALLOWED_UPDATES = [
      "gender",
      "age",
      "fName",
      "lName",
      "skills",
      "password",
    ];
    const isAllowed = Object.keys(upData).every((k) =>
      ALLOWED_UPDATES.includes(k)
    );
    if (!isAllowed) {
      throw new Error(" Can't updae the profile");
    }
    if (upData.skills) {
      if (upData.skills.length > 10) {
        throw new Error(" Skills can not be more than 10");
      }
    }
    if (upData.age < 5) {
      throw new Error(" Age can not be less than 5");
    }

    // const user = await User.findOneAndUpdate({ email: userEmail }, upData, {
    const user = await User.findByIdAndUpdate({ _id: userId }, upData, {
      returnDocument: "after",
      runValidators: true,
    });
    console.log(user);
    res.send("Updated Succefully");
  } catch (err) {
    res.status(404).send("Something Went Wrong" + err.message);
  }
});
//Get all data
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
