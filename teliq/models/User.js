// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    uid: {
      type: String, // Firebase UID
      unique: true,
      sparse: true, // allows multiple nulls if not using Firebase
    },
    username: {
      type: String,
      required: false, // optional if Firebase provides displayName
      trim: true,
    },
    email: {
      type: String,
      required: false, // optional for phone login
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: false, // optional for email login
      unique: true,
      sparse: true,
      trim: true,
    },
    password: {
      type: String,
      required: false, // optional because Google login won't have password
    },
    provider: {
      type: String,
      enum: ["manual", "google"], // to identify login method
      default: "manual",
    },
    profilePic: {
      type: String, // profile image URL (Firebase photoURL / manual upload)
      default: "",
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
