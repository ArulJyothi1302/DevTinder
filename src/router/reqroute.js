const express = require("express");
const { UserAuth } = require("../middleware/UserAuth");
const ConnectionRequestModel = require("../models/connectionRequest");
const reqRoute = express.Router();
const User = require("../models/user");
const sendEmail = require("../utils/sesSendEmail");

//Sending Request
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

    const emailRes = await sendEmail.run(
      "New Req in DevHub",
      req.user.fName + " sent you a request"
    );
    console.log("email:", emailRes);
    console.log("gName:", req.user.fName);
    res.json({
      message: "Connection Request Sent Successfully",
      data: RequestData,
    });
    // res.send(user.fName + " Sent Request");
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

// Reviewing Request

reqRoute.post(
  "/request/review/:status/:requestId",
  UserAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const { status, requestId } = req.params;
      //check status
      const AllowedStatus = ["accepted", "rejected"];
      if (!AllowedStatus.includes(status)) {
        return res.status(400).json({ message: "Status Not Valid..." });
      }

      const connectionRequest = await ConnectionRequestModel.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "interested",
      });

      //check the connevtion request from user
      if (!connectionRequest) {
        return res.status(400).json({ message: "Request Not Found..." });
      } else {
        connectionRequest.status = status;
        const data = await connectionRequest.save();
        res.json({ message: "Request " + status, data });
      }
    } catch (err) {
      res.status(404).send("ERROR: " + err.message);
    }
  }
);

module.exports = reqRoute;
