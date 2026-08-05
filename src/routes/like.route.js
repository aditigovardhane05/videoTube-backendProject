import { Router } from "express";
import { getLikedVideos, likeVideo, toggleCommentLike, toggleTweetLike, toggleVideoLike } from "../controllers/like.controller.js";
import { veryfyJWT } from "../middlewares/auth.middleware.js";

export const likeRouter = new Router()

likeRouter.use(veryfyJWT)

likeRouter.route("/likeVideo").post(likeVideo)

likeRouter.route("/toggaleLike").patch(toggleVideoLike)

likeRouter.route("/toggleCommentLike").patch(toggleCommentLike)

likeRouter.route("/toggleTweetLike").patch(toggleTweetLike)

likeRouter.route("/getLikedVideos").get(getLikedVideos)
