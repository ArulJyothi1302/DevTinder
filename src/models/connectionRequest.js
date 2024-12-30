const mongoose = require("mongoose");

const connectionRequestSchema = mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: ["interested", "accepted", "rejected", "ignored"],
        message: `{VALUE} is incorrect of Status type`,
      },
    },
  },
  { timestamps: true }
);

connectionRequestSchema.pre("save", function (next) {
  const connReq = this;
  if (connReq.fromUserId.equals(connReq.toUserId)) {
    throw new Error("You cannot send a req to yourself");
  }
  next();
});

const ConnectionRequestModel = new mongoose.model(
  "ConnectionRequest",
  connectionRequestSchema
);
module.exports = ConnectionRequestModel;
