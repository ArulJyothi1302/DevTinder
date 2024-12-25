const jwt = require("jsonwebtoken");

const User = require("../models/user");
const UserAuth = async (req, res, next) => {
  try {
    const cookies = req.cookies;
    const { token } = cookies;
    if (!token) {
      throw new Error(" invalid Toknen Please Login !!!");
    }
    const decodedMsg = await jwt.verify(token, "Dev@Comm1234");
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
