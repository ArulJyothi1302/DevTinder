const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();

const cors = require("cors");

const conDb = require("./config/database");
app.use(
  cors({
    origin: "http://localhost:5173", // Replace with your frontend URL
    credentials: true,
  })
);
const authRouter = require("./router/authroute");
const profileRoute = require("./router/profileroute");
const reqRoute = require("./router/reqroute");
const feedRoute = require("./router/feedRoute");
const userRoute = require("./router/userRoute");

app.use(express.json());

app.use(cookieParser());
const User = require("./models/user");

app.use("/", authRouter);
app.use("/", profileRoute);
app.use("/", feedRoute);
app.use("/", reqRoute);
app.use("/", userRoute);

conDb()
  .then(() => {
    console.log("Db Connected Succefully");
    app.listen(7777, () => {
      console.log("Server connected to port 7777");
    });
  })
  .catch((err) => {
    console.error("Not Connected");
  });
