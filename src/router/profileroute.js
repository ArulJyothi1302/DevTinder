const express = require("express");
const profileRoute = express.Router();

const { UserAuth } = require("../middleware/UserAuth");
profileRoute.get("/profile", UserAuth, async (req, res) => {
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

module.exports = profileRoute;
