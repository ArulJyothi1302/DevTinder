const express = require("express");
const { validateSignUp, setAuthCookies } = require("../utils/helper");
const { validateLogin } = require("../utils/login");
const { OAuth2Client } = require("google-auth-library");
const authRouter = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const RefreshToken = require("../models/refreshToken");
const bcrypt = require("bcrypt");
const { REFRESH_TOKEN_EXPIRY } = require("../utils/constants");
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
    const accessToken = user.getAccessToken();
    const refreshToken = user.getRefreshToken();
    await RefreshToken.create({
      userId: user._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY),
    });

    setAuthCookies(res, accessToken, refreshToken);
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
    const accessToken = user.getAccessToken();
    const refreshToken = user.getRefreshToken();
    await RefreshToken.create({
      userId: user._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY),
    });

    setAuthCookies(res, accessToken, refreshToken);

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
      const accessToken = user.getAccessToken();
      const refreshToken = user.getRefreshToken();

      await RefreshToken.create({
        userId: user._id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY),
      });
      setAuthCookies(res, accessToken, refreshToken);
      console.log("Logins");
      res.send(user);
    }
  } catch (err) {
    res.status(400).send("ERROR:" + err.message);
  }
});

authRouter.post("/logout", async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    console.log("Refresh Token:", refreshToken);

    const result = await RefreshToken.deleteOne({
      token: refreshToken,
    });

    console.log("Delete Result:", result);

    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    return res.status(200).send("Logout Successful");
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: err.message,
    });
  }
});
authRouter.post("/refresh-token", async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    console.log("rToken:", refreshToken);
    if (!refreshToken) {
      return res.status(401).send("Refresh token is missing");
    }
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const savedToken = await RefreshToken.findOne({
      token: refreshToken,
    });

    if (!savedToken) {
      return res.status(401).json({
        message: "Invalid refresh token",
      });
    }
    const user = await User.findById(decoded._id);
    if (!user) {
      return res.status(401).send("User not found");
    }
    await RefreshToken.deleteOne({
      token: refreshToken,
    });
    const accessToken = user.getAccessToken();
    const newRefreshToken = user.getRefreshToken();
    await RefreshToken.create({
      userId: user._id,
      token: newRefreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY),
    });
    setAuthCookies(res, accessToken, newRefreshToken);
    return res.status(200).json({
      message: "Access token Refreshed",
    });
  } catch (err) {
    console.error(err);

    return res.status(401).json({
      message: err.message,
    });
  }
});
module.exports = authRouter;
