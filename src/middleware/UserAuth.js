const jwt = require("jsonwebtoken");

const User = require("../models/user");
const UserAuth = async (req, res, next) => {
  try {
    const { accessToken } = req.cookies;
    if (!accessToken) {
      return res.status(401).send("Please Login");
    }
    const decodedMsg = jwt.verify(accessToken, process.env.JWT_SECRET);
    const id = decodedMsg;
    const user = await User.findById(id);
    if (!user) {
      throw new Error("User Not Found");
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(401).send("ERROR:" + err.message);
  }
};
module.exports = { UserAuth };
