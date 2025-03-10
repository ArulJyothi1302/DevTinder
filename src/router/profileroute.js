const express = require("express");
const profileRoute = express.Router();
const bcrypt = require("bcrypt");
const { UserAuth } = require("../middleware/UserAuth");
const { validateEditProfile, validatePassword } = require("../utils/helper");
const User = require("../models/user");
const { validatePasswordUpdate } = require("../controller/userController");
profileRoute.get("/profile/view", UserAuth, async (req, res) => {
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
profileRoute.patch("/profile/edit", UserAuth, async (req, res) => {
  try {
    if (!validateEditProfile(req)) {
      throw new Error("Unable to Update the Profile");
    }
    const loggedinUser = req.user;
    if (!loggedinUser) {
      console.log("Checking.............");
      throw new Error("User Not Found");
    }
    console.log("Before Update:" + loggedinUser);

    Object.keys(req.body).forEach((key) => (loggedinUser[key] = req.body[key]));
    await loggedinUser.save();

    console.log("After Update:" + loggedinUser);
    res.json({
      messsage: `${loggedinUser.fName} your Profile is Updated Successfully`,
      data: loggedinUser,
    });
  } catch (err) {
    res.status(404).send("ERROR:" + err.message);
  }
});
profileRoute.patch("/profile/password", UserAuth, async (req, res) => {
  try {
    const loggedinUser = req.user;
    if (!loggedinUser) {
      throw new Error("User Not Found");
    }
    if (!validatePassword(req)) {
      throw new Error("Unable to Update the Profile Check Password");
    }

    await validatePasswordUpdate(loggedinUser, req.body.password);
    res.json({
      message: `${loggedinUser.fName} your  Password Updated`,
      data: loggedinUser,
    });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});
module.exports = profileRoute;
