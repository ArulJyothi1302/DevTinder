const jwt = require("jsonwebtoken");

const User = require("../models/user");
const UserAuth = async (req, res, next) => {
  try {
    const cookies = req.cookies;
    const { token } = cookies;
    if (!token) {
      return res.status(401).send("Please Login");
    }
    const decodedMsg = await jwt.verify(token, process.env.JWT_SECRET);
    const id = decodedMsg;
    const user = await User.findById(id);
    if (!user) {
      throw new Error("User Not Found");
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(400).send("ERROR:" + err.message);
  }
};
module.exports = { UserAuth };
