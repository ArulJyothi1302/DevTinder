const validator = require("validator");
const validateLogin = (req) => {
  const { email, password } = req.body;
  if (!validator.isEmail(email)) {
    throw new Error("Invalid Email");
  }
  if (!validator.isStrongPassword(password)) {
    throw new Error("Invalid Password");
  }
};

module.exports = { validateLogin };
