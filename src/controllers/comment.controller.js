import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import {ApiResponse} from "../utils/apiResponse.js"

const getAllComments = asyncHandler(async (req,res,next)=>{
    const {videoId} = req.query

    if(!videoId){
        throw new ApiError("VideoId is required")
    }

    const comments = await Comment.aggregate([
        {
            $match :{
                video : new mongoose.Types.ObjectId(videoId)
            } 
        },
        {
            $lookup : {
                from : "comment",
                localField : "_id",
                foreignField : "video",
                as : "comments"
            }
        }
    ])

    if(!comments){
        throw new ApiError("No comments found")
    }

    res.status(201).json(
        new ApiResponse(201,comments,"Comments succesfully fetched")
    )
})

const addComment = asyncHandler(async (req,res,next)=>{
    const {commentText , videoId} = req.query

    if(!commentText || !videoId){
        throw new ApiError("Comment text and videoId is required")
    }

    const user = req.user
    
    if(user){
        new ApiError("User not found")
    }

    const comment = await Comment.create({
        content : commentText,
        video : videoId,
        owner : user
    })

    const createdComment = await Comment.findById(comment._id)

    if(!createdComment){
        new ApiError("Could not create a comment")
    }
    res.status(201).json(
        new ApiResponse(201,createdComment,"Comment added succesfully")
    )
}) 

const updateComment = asyncHandler(async (req, res) => {
    const {content , commentId} = req.query

    if(!content || !commentId){
        throw new ApiError("Commentid and content is required")
    }

    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set : {
                content
            }
        }
    )

    if(!updatedComment){
        throw new ApiError("Failed to update comment")
    }

    res.status(201).json(
        new ApiResponse(201,updatedComment,"Comment updated succesfully")
    )
})

const deleteComment = asyncHandler(async (req, res) => {
    const {commentId} = req.query

    if(!commentId){
        throw new ApiError("Commentid is required")
    }

    const deletedComment = await Comment.findByIdAndDelete(commentId)

    if(!deletedComment){
        throw new ApiError("Failed to delete comment")
    }

    res.status(201).json(
        new ApiResponse(201,deletedComment,"Comment deleted succesfully")
    )
})
export {
    getAllComments,
    addComment,
    updateComment,
    deleteComment
}