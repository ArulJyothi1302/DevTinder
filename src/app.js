const express = require("express");
const app = express();
app.use("/home", (req, res) => {
  res.send("Hello server is running");
});
app.use("/dashboard", (re1, res) => {
  res.send("welcome to dashboard");
});
app.use("/chat", (req, res) => {
  res.send("You are in chat ");
});
app.use("/profile", (req, res) => {
  res.send("Profile is here need to update?");
});
app.use("/login", (req, res) => {
  res.send("Login page enter credentials");
});
app.use("/signup", (req, res) => {
  res.send("Signup page enter credentials");
});
app.listen(7777);
