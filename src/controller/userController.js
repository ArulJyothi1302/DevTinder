const bcrypt = require("bcrypt");
const validatePasswordUpdate = async (user, inppassword) => {
  const isMatching = await bcrypt.compare(inppassword, user.password);
  if (isMatching) {
    throw new Error(
      `Dear ${user.fName} Password should not be same as Previous One`
    );
  }

  const hashPassword = await bcrypt.hash(inppassword, 10);
  user.password = hashPassword;
  await user.save();
};

module.exports = { validatePasswordUpdate };
