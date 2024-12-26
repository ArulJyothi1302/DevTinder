const express = require("express");
const { UserAuth } = require("../middleware/UserAuth");
const reqRoute = express.Router();

reqRoute.post("/sendrequest", UserAuth, async (req, res) => {
  const user = req.user;
  res.send(user.fName + " Sent Request");
});

module.exports = reqRoute;
