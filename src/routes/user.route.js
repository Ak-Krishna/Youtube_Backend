import { Router } from "express";
import { registerUser,loginUser, logoutUser, refreshAccessToken, updatePassword, getCurrentUser, updateAccountDetails, updateAvatar, updateCoverImage, getUserChannelProfile, watchHistory } from "../controllers/users.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJwt } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 2 },
    { name: "coverImage", maxCount: 2 },
  ]),
  registerUser
);
router.route("/login").post(loginUser)
router.route("/logout").post(verifyJwt,logoutUser);
router.route("/refreshToken").post(refreshAccessToken);
router.route("/updatePassword").post(verifyJwt,updatePassword)
router.route("/getUser").get(verifyJwt,getCurrentUser);
router.route("/update-account").post(verifyJwt,updateAccountDetails)
router.route("/update-avatar").patch(verifyJwt,upload.single("avatar"),updateAvatar);
router.route("/update-coverImage").patch(verifyJwt,upload.single("coverImage"),updateCoverImage);
router.route("/c/:username").get(verifyJwt,getUserChannelProfile);
router.route("/history").get(verifyJwt,watchHistory);


export default router;
