import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { Like } from "../models/like.model.js";
import { ApiResponse } from "../utils/apiResponse.js";

const likeVideo = asyncHandler(async(req , res , next)=>{
    const {videoId} = req.query

    if(!videoId){
        throw new ApiError(401,"VideoId is required")
    }

    const video = await Like.findOne(
        {
            video : videoId,
            likedBy: req.user
        }
    )

    if(video){
        throw new ApiError(501,"Video is already liked")
    }

    const likedVideo = await Like.create({
        video : videoId,
        likedBy : req.user
    })

    res.status(201).json(
        new ApiResponse(201,likedVideo,"Video liked successfully")
    )
} )

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.query

    if(!videoId){
        throw new ApiError(401,"VideoId is required")
    }

    console.log("videoId",videoId)

   try {
     const likedVideo = await Like.findOne({
        video : videoId,
        likedBy : req.user._id
     })
 
     if(likedVideo){

        const unLikedVideo = await Like.deleteOne({
            video: videoId,
            likedBy: req.user._id
        });
        res.status(201).json(
            new ApiResponse(201,unLikedVideo,"Unliked video" )
        )
     }else{
        
        console.log("Creating like...");

         const likedVideo = await Like.create({
            video : videoId,
            likedBy : req.user._id
         })

         res.status(201).json(
            new ApiResponse(201,likedVideo,"liked video" )
         )        
     }
 
   } catch (error) {
                console.log(error)

        throw new ApiError(501,"Couldnt find the video")
   }

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.query

    if(!commentId){
        throw new ApiError(401,"commentId is required")
    }

   try {
     const likedComment = await Like.findOne({
        comment : commentId,
        likedBy : req.user._id
     })
 
     if(likedComment){

        const unLikedComment = await Like.deleteOne({
            comment: commentId,
            likedBy: req.user._id
        });
        res.status(201).json(
            new ApiResponse(201,unLikedComment,"Unliked comment" )
        )
     }else{
        
        console.log("Creating like...");

         const likedComment = await Like.create({
            comment : commentId,
            likedBy : req.user._id
         })

         res.status(201).json(
            new ApiResponse(201,likedComment,"liked comment" )
         )        
     }
 
   } catch (error) {
                console.log(error)

        throw new ApiError(501,"Couldnt find the video")
   }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.query

    if(!tweetId){
        throw new ApiError(401,"commentId is required")
    }

   try {
     const likedTweet = await Like.findOne({
        tweet : tweetId,
        likedBy : req.user._id
     })
 
     if(likedTweet){

        const unLikedTweet = await Like.deleteOne({
            tweet: tweetId,
            likedBy: req.user._id
        });
        res.status(201).json(
            new ApiResponse(201,unLikedTweet,"Unliked tweet" )
        )
     }else{
        
        console.log("Creating like...");

         const likedTweet = await Like.create({
            tweet : tweetId,
            likedBy : req.user._id
         })

         res.status(201).json(
            new ApiResponse(201,likedTweet,"liked tweet" )
         )        
     }
 
   } catch (error) {
                console.log(error)

        throw new ApiError(501,"Couldnt find the tweet")
   }

})

const getLikedVideos = asyncHandler(async (req,res)=>{
    const user = req.user
    if(!user){
        throw new ApiError(401,"User not found")
    }

    const likedVideos = await Like.find({
        likedBy : user._id,
        video : {$exists : true , $ne : null}
    })

    if(!likedVideos){
        throw new ApiError(501,"failed fetch videos")
    }

    res.status(201).json(
        new ApiResponse(201,likedVideos,"Successfully fetched all liked videos")
    )
})

export {
    likeVideo,
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos
}