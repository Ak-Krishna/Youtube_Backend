import Jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

export const verifyJwt = asyncHandler(async (req, _, next) => {
  try {
    console.log("i am in try of verify jwt")
    const token =
      req.cookies?.AccessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    console.log("token ", token);
    if (!token) {
      throw new ApiError(403, "Unauthorized request");
    }
    const decodeToken = Jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log(decodeToken?._id);
    const user=await User.findById(decodeToken?._id).select("-password -refreshToken");

    if(!user){
        throw new ApiError(402,"Invalid access Token")
    }
    req.user=user;
    next();
  } catch (error) {
    throw new ApiError(403, error?.message || "invalid access token");
  }
});
