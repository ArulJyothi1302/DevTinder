const express = require("express");
const feedRoute = express.Router();
const User = require("../models/user");
const { UserAuth } = require("../middleware/UserAuth");

const connectionRequest = require("../models/connectionRequest");

const SafeData = "fName lName age gender skills photoUrl";
feedRoute.get("/feed", UserAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const { cursor } = req.query;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 20 ? 10 : limit;
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

    const query = {
      $and: [
        {
          _id: { $nin: Array.from(HideUsers) },
        },
        {
          _id: { $ne: loggedInUser._id },
        },
      ],
    };
    if (cursor) {
      query.$and.push({
        _id: { $lt: cursor },
      });
    }

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
      .limit(limit)
      .sort({ _id: -1 });

    const nextCursor = users.length > 0 ? users[users.length - 1]._id : null;
    const hasMore = users.length === limit;

    res.json({ data: users, nextCursor: nextCursor, hasMore: hasMore });
  } catch (err) {
    res.status(404).send("ERROR: " + err.message);
  }
});
module.exports = feedRoute;
