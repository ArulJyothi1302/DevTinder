const validator = require("validator");

const validateSignUp = (req) => {
  const { fName, lName, email, password } = req.body;

  if (!fName || !lName) {
    throw new Error("Name should not be Empty");
  } else if (!validator.isEmail(email)) {
    throw new Error("Enter a valid Email");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Enter a valid Strong Password");
  }
};
module.exports = { validateSignUp };
