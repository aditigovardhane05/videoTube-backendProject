import { Router } from "express";
import { 
    loginUser,
    logOutUser,
    registerUser ,
    refreshAccessToken, 
    updateUserAvatar, 
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateCoverImage,
    getUserChannelProfile,
    getWatchHistory
} from "../controllers/user.controller.js";
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

userRouter.route("/updateAvatar".post(upload.single("image"),updateUserAvatar))

userRouter.route("/changePassword".post(veryfyJWT,changeCurrentPassword))

userRouter.route("/current-user".get(veryfyJWT,getCurrentUser))

userRouter.route("/updateAccountDetails".patch(updateAccountDetails))

userRouter.route("/update-avatar".patch(veryfyJWT,upload.single(avatar) ,updateUserAvatar))

userRouter.route("/update-coverImage".patch(veryfyJWT,upload.single(coverImage) , updateCoverImage))

userRouter.route("/C/:userName".get(veryfyJWT , getUserChannelProfile))

userRouter.route("/getWatchHistory".get(veryfyJWT , getWatchHistory))





export default userRouter