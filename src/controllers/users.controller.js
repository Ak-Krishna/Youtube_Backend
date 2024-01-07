import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/coudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Jwt from "jsonwebtoken";

//generate access and refresh token
const generateAccessAndRefreshToken = async (UserId) => {
  try {
    console.log("i am in try");
    const user = await User.findById(UserId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refresToken = refreshToken;
    await user.save({ validateBeforeSave: false });
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

  const loggedInUser = await User.findById(user._id).select("-password");

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

  res
    .status(200)
    .clearCookie("AccessToken", optios)
    .clearCookie("RefreshToken", optios)
    .json(new ApiResponse(201, {}, "User Logout Successfully"));
});

//controller for refresh Access
const refreshAccessToken = asyncHandler(async (req, res) => {
  // console.log("cookies " ,req.cookies)
  const incomingToken = req.cookies?.RefreshToken || req.body.RefreshToken;
  // console.log(incomingToken)
  if (!incomingToken) {
    throw new ApiError(403, "unAuthorised request");
  }
  try {
    const decodedToken = Jwt.verify(
      incomingToken,
      process.env.REFRESH_TOKEN_SECRETE
    );
    console.log("id ", decodedToken?._id);
    const user = await User.findById(decodedToken?._id);

    // console.log("tokens : ",incomingToken);
    if (!user) {
      throw new ApiError(401, "invalid refresh token");
    }

    if (incomingToken !== user?.refresToken) {
      throw new ApiError(403, "refresh token expired or used");
    }
    const options = {
      httpOnly: true,
      secure: true,
    };
    const { accessToken, newRefreshToken } = generateAccessAndRefreshToken(
      user?._id
    );

    return res
      .status(200)
      .cookie("AccessToken", accessToken, options)
      .cookie("RefreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshAccessToken: newRefreshToken },
          "Access token refresh successfully"
        )
      );
  } catch (error) {
    throw new ApiError(403, "invalid refresh token");
  }
});
//controller for update Password
const updatePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  console.log(oldPassword);
  console.log(req.user);
  if (!oldPassword && !newPassword) {
    throw new ApiError(401, "All fileds are required");
  }
  const user = await User.findById(req.user?._id);

  console.log(req.user?._id);
  const isPasswordValid = user.isPasswordCorrect(oldPassword);
  if (!isPasswordValid) {
    throw new ApiError(403, "Enter valid password");
  }
  user.password = newPassword;
  user.save({ validateBeforeSave: false });

  return res
    .status(201)
    .json(new ApiResponse(201, {}, "Password change successfully"));
});

//controller for current user details
const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id).select(
    "-password -refreshToken"
  );
  if (!user) {
    throw new ApiError(404, "User Not Found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, { user }, "User data fetch successfully"));
});

//controller for update account details
const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;
  if (!fullName && !email) {
    throw new ApiError(403, "All fields are required");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      fullName,
      email,
    },
    { new: true }
  ).select("-password -refreshToken");

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        user,
      },
      "User data updated successfully"
    )
  );
});

//controller for update avatar
const updateAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  console.log(req.file.path)
  if (!avatarLocalPath) {
    throw new ApiError(401, "avatar path is required");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar.url) {
    throw new ApiError(401, "Error while updating avatar");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: { avatar: avatar?.url },
    },
    { new: true }
  ).select("-password -refreshToken")
res.status(201).json(new ApiResponse(201,{user},"avatr updated successfully"));
});


//controller for update cover image
const updateCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;
  if (!coverImageLocalPath) {
    throw new ApiError(401, "coverImage path is required");
  }
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!coverImage.url) {
    throw new ApiError(401, "Error while updating avatar");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: { coverImage: coverImage?.url }
    },
    { new: true }
  ).select("-password -refreshToken");
  return res.status(201).json(new ApiResponse(200,{user},"coverImage updated successfully"))
});

  

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  updatePassword,
  getCurrentUser,
  updateAccountDetails,
  updateAvatar,
  updateCoverImage
};
