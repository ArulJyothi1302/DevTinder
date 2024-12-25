const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const conDb = require("./config/database");
app.use(express.json());

app.use(cookieParser());
const User = require("./models/user");
const { validateSignUp } = require("./utils/helper");

const { validateLogin } = require("./utils/login");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { UserAuth } = require("./middleware/UserAuth");
app.post("/signup", async (req, res) => {
  try {
    validateSignUp(req);
    const { fName, lName, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    // console.log(hashedPassword);
    const user = new User({ fName, lName, email, password: hashedPassword });
    const data = user;
    if (data.skills) {
      if (data.skills.length > 10) {
        throw new Error(
          "Skills can not be more than 10 only Add upto 10 Skills"
        );
      }
    }
    if (data.age <= 5) {
      throw new Error("Set a Valid Age");
    }
    await user.save();
    res.send("Data Added successfully");
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
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
app.get("/feed", async (req, res) => {
  const user = await User.find({});

  user.length === 0 ? res.send(user) : res.status(404).send("User Not Found");
});

app.post("/login", async (req, res) => {
  try {
    validateLogin(req);
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    //Email Check
    if (!user) {
      throw new Error("Invalid Credentials");
    }
    const isCorrectPassword = await user.validatePassword(password);
    //Passwod Check
    if (!isCorrectPassword) {
      throw new Error("Invalid Credentials");
    } else {
      const token = await user.getJwt();
      res.cookie("token", token, {
        expires: new Date(Date.now() + 8 * 3600000),
      });
      res.send("Login Successful");
    }
  } catch (err) {
    res.status(400).send("ERROR:" + err.message);
  }
});
app.get("/profile", UserAuth, async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      throw new Error("User not found");
    }
    await res.send(user);
  } catch (err) {
    res.status(400).send("ERROR:" + err.message);
  }
});
app.post("/sendrequest", UserAuth, async (req, res) => {
  const user = req.user;
  res.send(user.fName + " Sent Request");
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
