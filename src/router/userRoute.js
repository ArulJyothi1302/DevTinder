const express = require("express");
const { UserAuth } = require("../middleware/UserAuth");
const ConnectionRequest = require("../models/connectionRequest");
const userRoute = express.Router();

const User_Safe_Data = "fName lName age skills";
userRoute.get("/user/request/received", UserAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequest = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", User_Safe_Data);
    res.json({
      message: "Your Connection Requests..",
      data: connectionRequest,
    });
  } catch (err) {
    res.status(404).send("ERROR: " + err.message);
  }
});

userRoute.get("/user/connections", UserAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connectionRequest = await ConnectionRequest.find({
      $or: [
        {
          toUserId: loggedInUser._id,
          status: "accepted",
        },
        {
          fromUserId: loggedInUser._id,
          status: "accepted",
        },
      ],
    })
      .populate("fromUserId", User_Safe_Data)
      .populate("toUserId", User_Safe_Data);

    console.log(connectionRequest);

    const data = connectionRequest.map((row) => {
      if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return row.toUserId;
      }
      return row.fromUserId;
    });

    res.json({ data: data });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});
module.exports = userRoute;
