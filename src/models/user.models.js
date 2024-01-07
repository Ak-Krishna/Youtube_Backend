import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String,
      required: true,
    },
    coverImage: {
      type: String,
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    refresToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

//pre is used for encrypt password before saving the data
userSchema.pre("save",async function (next) {
  if (!this.isModified("password")) return next();
  this.password =  await bcrypt.hash(this.password, 10);
  next();
});

//methods are used for crosscheck the given data is valid
userSchema.methods.isPasswordCorrect = async function (password) {
  console.log(password,this.password)
  return await bcrypt.compare(password, this.password);
};

//method for generating access token
userSchema.methods.generateAccessToken = function () {
  console.log(process.env.ACCESS_TOKEN_SECRET);
  console.log("i am in generate acccess token method")
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.userName,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
  )
};

//method for generate refresh token
userSchema.methods.generateRefreshToken = function () {
  console.log("i am in generate refresh token method")
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRETE,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
