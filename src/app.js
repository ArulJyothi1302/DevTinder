const express = require("express");
const app = express();
const { AdminAuth, userAuth } = require("./middleware/auth");

//Middleware
{
  app.post("/user/login", (req, res) => {
    //for login page Authorization not needed
    res.send("Enter Credentials");
  });
  app.get("/user", userAuth, (req, res) => {
    //single route so  authorization will check here if true come to res else userAuth will send status error
    res.send("User Acessed");
  });
  app.use("/admin", AdminAuth);
  app.get("/admin/getProfile", (req, res, next) => {
    res.send("Profile Viewed");
  });
  app.get("/admin/deleteProfile", (req, res) => {
    res.send("Deleted Successfully");
  });
}

//ERROR HANDLING
// if I used here and calling/getdata getdata only will call and throw error coz i used try catch
//if there is no common route with error handling and try catch in /getdata it will return the error warning
app.use("/", (err, req, res, next) => {
  if (err) {
    res.status(500).send("Something Went Wrong");
  }
});
app.use("/getdata", (req, res) => {
  // throw new Error("error happened");
  // res.send("Data got");
  // use try catch for better error handling
  try {
    throw new Error("error happened");
    res.send("Data Got");
  } catch (err) {
    res.status(500).send("Something went wrong Contact Customer Support");
  }
  // if no try catch below code will execute
});

// to handle this
app.use("/", (err, req, res, next) => {
  if (err) {
    res.status(500).send("Something Went Wrong");
  }
});

app.listen(7777);
