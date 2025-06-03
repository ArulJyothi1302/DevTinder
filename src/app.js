const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();

const cors = require("cors");

const conDb = require("./config/database");
require("dotenv").config();
require("./utils/cronJob");
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

app.use("/", authRouter);
app.use("/", profileRoute);
app.use("/", feedRoute);
app.use("/", reqRoute);
app.use("/", userRoute);

conDb()
  .then(() => {
    console.log("Db Connected Succefully");
    app.listen(process.env.PORT, () => {
      console.log("Server connected to port 7777");
    });
  })
  .catch((err) => {
    console.error("Database Not Connected");
  });
