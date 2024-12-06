const AdminAuth = (req, res, next) => {
  const token = "xyz";
  const isAdminAuthorized = token === "xyz";
  if (!isAdminAuthorized) {
    res.status(401).send("UnAuthorized Status 401 error");
  } else {
    next();
  }
};
const userAuth = (req, res, next) => {
  const token = "xyz";
  const isAdminAuthorized = token === "xyz";
  if (!isAdminAuthorized) {
    res.status(401).send("UnAuthorized Status 401 error");
  } else {
    next();
  }
};
module.exports = { AdminAuth, userAuth };
