const express = require("express");
const { validateSignUp } = require("../utils/helper");
const { validateLogin } = require("../utils/login");
const authRouter = express.Router();

const User = require("../models/user");
const bcrypt = require("bcrypt");
//signup
authRouter.post("/signup", async (req, res) => {
  try {
    validateSignUp(req);
    const { fName, lName, email, password, age, skills, gender } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    // console.log(hashedPassword);
    const user = new User({
      fName,
      lName,
      email,
      password: hashedPassword,
      age,
      skills,
      gender,
    });
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
    const savedUser = await user.save();
    const token = await savedUser.getJwt();
    res.cookie("token", token, {
      expires: new Date(Date.now() + 8 * 3600000),
    });

    res.json({ message: "Data Added successfully", data: savedUser });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

//login

authRouter.post("/login", async (req, res) => {
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
      console.log("Logins");
      res.send(user);
    }
  } catch (err) {
    res.status(400).send("ERROR:" + err.message);
  }
});

module.exports = authRouter;

authRouter.post("/logout", async (req, res) => {
  res.cookie("token", null, { expires: new Date(Date.now()) });
  await res.send("Logout Successful");
});
