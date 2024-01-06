import { Router } from "express";
import { registerUser,loginUser } from "../controllers/users.controller.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 2 },
    { name: "coverImage", maxCount: 2 },
  ]),
  registerUser
);
router.route("/login").post(loginUser)

export default router;
