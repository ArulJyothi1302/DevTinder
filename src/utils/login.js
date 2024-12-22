const validator = require("validator");
const validateLogin = (req) => {
  const { email, password } = req.body;
  if (!validator.isEmail(email)) {
    throw new Error("Invalid Email");
  }
};
module.exports = { validateLogin };
