const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    fName: {
      type: String,
      required: true,
      minlength: 4,
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
      default:
        "https://www.google.com/url?sa=i&url=https%3A%2F%2Fuxwing.com%2Fuser-male-icon%2F&psig=AOvVaw0WottDsniUsUUBOAqad5LQ&ust=1734887116717000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCJiElaqsuYoDFQAAAAAdAAAAABAE",
    },
  },
  {
    timestamps: true,
  }
);
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
const UserModeel = mongoose.model("User", userSchema);
module.exports = UserModeel;
