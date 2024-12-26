const express = require("express");
const feedRoute = express.Router();
const User = require("../models/user");
feedRoute.get("/feed", async (req, res) => {
  const user = await User.find({});

  user.length === 0 ? res.send(user) : res.status(404).send("User Not Found");
});
module.exports = feedRoute;
