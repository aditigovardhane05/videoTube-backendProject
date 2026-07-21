import { Router } from "express";
import { loginUser, logOutUser, registerUser ,refreshAccessToken} from "../controllers/user.controller.js";
import upload from "../config/multerS3Config.js";
import fs from "fs"
import { veryfyJWT } from "../middlewares/auth.middleware.js";

const userRouter = Router()
console.log("User router loaded");

userRouter.route("/register").post(upload.fields(
    [
        {
            name: "avatar",
            maxCount: 1
        }, 
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)

userRouter.route("/login").post(loginUser)

userRouter.route("/logout").post(veryfyJWT, logOutUser)
userRouter.route("/refresh-token").post(refreshAccessToken)

export default userRouter