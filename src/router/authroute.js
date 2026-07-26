const express = require("express");
const { validateSignUp, setAuthCookie } = require("../utils/helper");
const { validateLogin } = require("../utils/login");
const { OAuth2Client } = require("google-auth-library");
const authRouter = express.Router();

const User = require("../models/user");
const bcrypt = require("bcrypt");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
//signup

authRouter.post("/google", async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      throw new Error("Google Credential is required");
    }
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub, email, email_verified, given_name, family_name, picture } =
      payload;

    let user = await User.findOne({
      "providers.providerId": sub,
    });
    if (!user) {
      console.log("Searching Existing Google User");
      user = await User.findOne({ email });
      if (user) {
        if (!email_verified) {
          throw new Error("User email not verified");
        }
        if (!user.hasProvider("google")) {
          user.providers.push({
            type: "google",
            providerId: sub,
          });
          user.emailVerified = email_verified;
          user.photoUrl = !user.photoUrl ? picture : user.photoUrl;
          await user.save();
        }
      } else {
        user = new User({
          fName: given_name || payload.name,
          lName: family_name || "",
          email: email,
          emailVerified: email_verified,
          photoUrl: picture,
          providers: [
            {
              type: "google",
              providerId: sub,
            },
          ],
          profileCompleted: false,
        });

        await user.save();
      }
    }
    const token = await user.getJwt();
    setAuthCookie(res, token);
    res.status(200).json({
      message: "Google login successful",
      user,
    });
  } catch (err) {
    res.status(400).send("ERROR:" + err.message);
  }
});

authRouter.post("/signup", async (req, res) => {
  try {
    validateSignUp(req);
    const { fName, lName, email, password, age, skills, gender } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      fName,
      lName,
      email,
      password: hashedPassword,
      age,
      skills,
      gender,
      providers: [
        {
          type: "local",
        },
      ],
    });
    const data = user;
    if (data.skills) {
      if (data.skills.length > 10) {
        throw new Error(
          "Skills can not be more than 10 only Add upto 10 Skills",
        );
      }
    }
    if (data.age <= 5) {
      throw new Error("Set a Valid Age");
    }
    const savedUser = await user.save();
    const token = await savedUser.getJwt();
    setAuthCookie(res, token);

    res.json({ message: "Data Added successfully", data: savedUser });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

//login

authRouter.post("/login", async (req, res) => {
  try {
    validateLogin(req);
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    //Email Check
    if (!user) {
      throw new Error("Invalid Credentials");
    }
    if (!user.hasProvider("local")) {
      throw new Error(
        "This account uses Google Sign-In. Please continue with Google.",
      );
    }
    const isCorrectPassword = await user.validatePassword(password);
    //Passwod Check
    if (!isCorrectPassword) {
      throw new Error("Invalid Credentials");
    } else {
      const token = await user.getJwt();
      setAuthCookie(res, token);
      console.log("Logins");
      res.send(user);
    }
  } catch (err) {
    res.status(400).send("ERROR:" + err.message);
  }
});

module.exports = authRouter;

authRouter.post("/logout", async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  await res.send("Logout Successful");
});
