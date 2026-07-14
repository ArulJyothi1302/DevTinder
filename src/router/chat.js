const express = require("express");
const { UserAuth } = require("../middleware/UserAuth");
const { Chat } = require("../models/chat");
const chatRoute = express.Router();

chatRoute.get("/chat/:targetUserId", UserAuth, async (req, res) => {
  try {
    const { targetUserId } = req.params;
    const userId = req.user._id;
    console.log("userId:", userId);
    let chat = await Chat.findOne({
      participants: { $all: [userId, targetUserId] },
    }).populate({
      path: "message.senderId",
      select: "fName lName",
    });
    if (!chat) {
      chat = new Chat({
        participants: [userId, targetUserId],
        message: [],
      });
      await chat.save();
    }
    res.json(chat);
  } catch (err) {
    console.error("Error:", err.message);
    res.status(404).send("ERROR: " + err.message);
  }
});

module.exports = chatRoute;
