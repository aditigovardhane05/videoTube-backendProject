import mongoose from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

const createTweet = asyncHandler(async(req,res,next)=>{
    const {content}=req.query

    if(!content){
        throw new ApiError("Content is required")
    }

    const tweet = await Tweet.create({
        content : content,
        owner : req.user
    })

    const createdTweet = await Tweet.findById(tweet._id)

    if(!createTweet){
        throw new ApiError("Failed to create tweet")
    }

    res.status(201).json(
        new ApiResponse(201,createdTweet,"Failed to create tweet")
    )

})

const getUserTweets = asyncHandler(async (req, res) => {
    const {userId} = req.query

    if(!userId){
        throw new ApiError(401,"UserId is required")
    }

    const tweets = await Tweet.aggregate([
        {
            $match : {
                owner : new mongoose.Types.ObjectId(userId)
            }        
        }
    ])

    if(!tweets){
        throw new ApiError(401,"No tweets found")
    }

    res.status(201).json(
        new ApiResponse(201,tweets,"Tweets found successfully")
    )
})

const updateTweet = asyncHandler(async (req, res) => {
    const {tweetId , content} = req.query

    if(!tweetId || !content){
        throw new ApiError(401,"tweetId and content is required")
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set : {
                content
            }
        },
        {
            new : true
        }
    )

    if(!updatedTweet){
        throw new ApiError(401,"Tweet not found")
    }

    res.status(201).json(
        new ApiResponse(201,updatedTweet,"Tweets updated successfully")
    )
})

const deleteTweet = asyncHandler(async (req, res) => {
    const {tweetId} = req.query

    if(!tweetId){
        throw new ApiError(401,"tweetId is required")
    }

    const deletedTweet = await Tweet.findByIdAndDelete(tweetId)

    if(!deletedTweet){
        throw new ApiError(401,"Tweet not found")
    }

    res.status(201).json(
        new ApiResponse(201,deletedTweet,"Tweet deleted successfully")
    )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}