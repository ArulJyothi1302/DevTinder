const express = require("express");
const { UserAuth } = require("../middleware/UserAuth");
const ConnectionRequestModel = require("../models/connectionRequest");
const reqRoute = express.Router();
const User = require("../models/user");

reqRoute.post("/request/send/:status/:touserid", UserAuth, async (req, res) => {
  try {
    const Allowed_Stauts = ["interested", "ignored"];
    const fromUserId = req.user._id;
    const toUserId = req.params.touserid;
    const status = req.params.status;

    // check a valid user
    const toUser = await User.findById(toUserId);
    if (!toUser) {
      return res.status(404).json({ message: "Not a Valid User" });
    }
    // check existing Connection
    const existConnReq = await ConnectionRequestModel.findOne({
      $or: [
        { fromUserId, toUserId },
        { fromUserId: toUserId, toUserId: fromUserId },
      ],
    });
    if (existConnReq) {
      return res.status(404).json({ message: "Conncection already sent" });
    }

    const connectionRequest = new ConnectionRequestModel({
      fromUserId,
      toUserId,
      status,
    });
    // check valid user

    // checking only 2 status
    if (!Allowed_Stauts.includes(status)) {
      return res.status(400).send("Status is not valid");
    }

    const RequestData = await connectionRequest.save();
    res.json({
      message: "Connection Request Sent Successfully",
      data: RequestData,
    });
    // res.send(user.fName + " Sent Request");
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

module.exports = reqRoute;
