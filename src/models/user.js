const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const userSchema = mongoose.Schema(
  {
    fName: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 50,
      trim: true,
    },
    lName: {
      type: String,

      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid Email");
        }
      },
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
    },
    phone: {
      type: Number,
    },
    age: {
      type: Number,
      min: 18,
    },
    gender: {
      type: String,
      validate(value) {
        if (!["male", "female", "others"].includes(value)) {
          throw new Error("Invalid Gender");
        }
      },
    },
    dob: {
      type: Date,
    },
    photoUrl: {
      type: String,
      default: "https://geographyandyou.com/images/user-profile.png",
    },
    providers: [
      {
        type: {
          type: String,
          enum: ["local", "google"],
          required: true,
        },
        providerId: {
          type: String,
          default: null,
        },
        linkedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    profileCompleted: {
      type: Boolean,
      default: false,
    },
    skills: {
      type: [String],
    },
    about: {
      type: String,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    membershipType: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.methods.getAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "15m",
    },
  );
};
userSchema.methods.getRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: "7d",
    },
  );
};
userSchema.methods.validatePassword = async function (inputPassword) {
  const user = this;
  const hashedPassword = user.password;
  const isValidPassword = await bcrypt.compare(inputPassword, hashedPassword);
  return isValidPassword;
};

userSchema.methods.hasProvider = function (providerType) {
  return this.providers.some((provider) => provider.type === providerType);
};

// another way
//   {
//       const { Schema } = mongoose;

//   const blogSchema = new Schema({
//     title: String,   //String is shorthand for {type: String}
//     author: String,
//     body: String,
//     comments: [{ body: String, date: Date }],
//     date: { type: Date, default: Date.now },
//     hidden: Boolean,
//     meta: {
//       votes: Number,
//       favs: Number
//     }
//   });
//    }
userSchema.index({ "providers.providerId": 1 });
const UserModeel = mongoose.model("User", userSchema);
module.exports = UserModeel;
