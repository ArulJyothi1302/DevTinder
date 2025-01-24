const express = require("express");
const feedRoute = express.Router();
const User = require("../models/user");
const { UserAuth } = require("../middleware/UserAuth");

const connectionRequest = require("../models/connectionRequest");

const SafeData = "fName lName age gender skills photoUrl";
feedRoute.get("/feed", UserAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 20 ? 10 : limit;
    const skip = (page - 1) * limit;

    const connections = await connectionRequest
      .find({
        $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
      })
      .select("fromUserId toUserId");
    // .populate("fromUserId", SafeData);

    const HideUsers = new Set();
    connections.forEach((reqs) => {
      HideUsers.add(reqs.fromUserId.toString());
      HideUsers.add(reqs.toUserId.toString());
    });

    // console.log(HideUsers);

    const users = await User.find({
      $and: [
        {
          _id: { $nin: Array.from(HideUsers) },
        },
        {
          _id: { $ne: loggedInUser._id },
        },
      ],
    })
      .select(SafeData)
      .skip(skip)
      .limit(limit);

    res.json({ data: users });
  } catch (err) {
    res.status(404).send("ERROR: " + err.message);
  }
});
module.exports = feedRoute;
