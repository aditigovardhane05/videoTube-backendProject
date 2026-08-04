import { Router } from "express";
import { veryfyJWT } from "../middlewares/auth.middleware.js";
import { createTweet, deleteTweet, getUserTweets, updateTweet } from "../controllers/tweet.controller.js";

export const tweetRouter = new Router()

tweetRouter.use(veryfyJWT)

tweetRouter.route("/createTweet").post(createTweet)

tweetRouter.route("/getUserTweets").get(getUserTweets)

tweetRouter.route("/updateTweet").patch(updateTweet)

tweetRouter.route("/deleteTweet").delete(deleteTweet)