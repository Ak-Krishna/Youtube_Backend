import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/coudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = await req.body;

  //user validation
  if ([fullName, email, username].some((field) => field?.trim() === "")) {
    throw new ApiError(403, "All fields are required");
  }

  //check if user is already exist
  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existingUser) {
    throw new ApiError("403", "User with email or username is already exist");
  }

  //avatar image
  const avatarLocalPath = req.files?.avatar[0].path;
  const coverImageLocalPath = req.files?.coverImage[0].path;
  if (!avatarLocalPath) {
    throw new ApiError(404, "avatar image is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(404, "avatar image is required");
  }

  //create object with user
  const user = await User.create({
    username,
    password,
    email,
    fullName,
    avatar: avatar?.url,
    coverImage: coverImage?.url,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

if(!createdUser){
    throw new ApiError(503,"something wents wrong while registering user")
}

return res.status(200).json(
     new ApiResponse(200,createdUser,"User created successfully"),
)  


});

export { registerUser };
