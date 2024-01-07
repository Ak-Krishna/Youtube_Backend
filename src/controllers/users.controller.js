import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/coudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

//generate access and refresh token
const generateAccessAndRefreshToken = async (UserId) => {
  try {
    console.log("i am in try");
    const user = await User.findById(UserId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      503,
      "something wents wrong while generating refresh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = await req.body;
  // console.log("user data get successfully", email);

  //user validation
  if ([fullName, email, username].some((field) => field?.trim() === "")) {
    throw new ApiError(403, "All fields are required");
  }
  // console.log("no error for filed")

  //check if user is already exist
  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existingUser) {
    throw new ApiError("403", "User with email or username is already exist");
  }
  console.log("checked for existing user");

  //avatar image
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0].path;
  if (!avatarLocalPath) {
    throw new ApiError(403, "Avatar image is required");
  }
  console.log("avatar imager get :", avatarLocalPath);

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  console.log("avatar url get :", avatar?.url);
  console.log("cover image url :", coverImage?.url);

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

  if (!createdUser) {
    throw new ApiError(503, "something wents wrong while registering user");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, createdUser, "User created successfully"));
});

//controller to login the user
const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = await req.body;
  console.log(email);

  if (!email && !username) {
    throw new ApiError(402, "email or username is required");
  }

  console.log("user data fetch");
  //check user is exist or not
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (!user) {
    throw new ApiError(402, "user with this email or username does not exist");
  }
  console.log("user data fetch from database");
  //check for password is correct or not
  const validatePassword = await user.isPasswordCorrect(password);
  console.log(validatePassword);
  if (!validatePassword) {
    throw new ApiError(402, "invalid user credentials");
  }
  // console.log("validate user password",validatePassword)
  console.log(user._id);
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user?._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  const optios = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("AccessToken", accessToken, optios)
    .cookie("RefreshToken", refreshToken, optios)
    .json(
      new ApiResponse(200, { user: loggedInUser }, "User LoggedIn successfully")
    );
});

//controller for logout the user
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $unset: { refreshToken: "" },
    },
    {
      new: true,
    }
  );
  const optios = {
    httpOnly: true,
    secure: true,
  };

  res.status(200)
  .clearCookie("AccessToken", optios)
  .clearCookie("RefreshToken",optios)
  .json(new ApiResponse(
    201,
    {},
    "User Logout Successfully"
  ));
});
export { registerUser, loginUser, logoutUser };
