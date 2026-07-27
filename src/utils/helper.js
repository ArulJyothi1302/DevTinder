const validator = require("validator");

const validateSignUp = (req) => {
  const { fName, lName, email, password } = req.body;

  if (!fName && !lName) {
    throw new Error("Name should not be Empty");
  } else if (!validator.isEmail(email)) {
    throw new Error("Enter a valid Email");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Enter a valid Strong Password");
  }
};
const validateEditProfile = (req) => {
  const AllowedData = [
    "fName",
    "lName",
    "email",
    "gender",
    "skills",
    "age",
    "photoUrl",
    "about",
  ];
  const isAllowed = Object.keys(req.body).every((field) =>
    AllowedData.includes(field),
  );
  return isAllowed;
};

const validatePassword = (req) => {
  const AllowedData = ["password"];
  const isAllowed = Object.keys(req.body).every((field) =>
    AllowedData.includes(field),
  );
  if (!validator.isStrongPassword(req.body.password)) {
    throw new Error("Invalid password, password should be Strong ");
  }
  return isAllowed;
};

const setAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};
module.exports = {
  validateSignUp,
  validateEditProfile,
  validatePassword,
  setAuthCookies,
};
