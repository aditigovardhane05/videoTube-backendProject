import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { getVideoDuration } from "../config/ffmpegonfig.js";
import { ApiResponse } from "../utils/apiResponse.js";

const publishOnVideoTube = asyncHandler(async (req,res,next)=>{
   const {title,description} = req.body

   console.log("Reached publish video")
    if(!title || !description){
        new ApiError(400,"Title and description are compulsory needed")
    }

    if(title.trim.length === 0 || description.trim.length === 0){
        new ApiError(400,"Title and description should not be empty")
    }

    const videoFileUrl = req.files?.videoFile[0]?.location    
    const thumbnailUrl = req.files?.thumbnail[0]?.location

    console.log("Video file url",videoFileUrl)
    
    if(!videoFileUrl){
        new ApiError(400,"Videofile is required")
    }

    if(!thumbnailUrl){
        new ApiError(400,"Thumbnail is required")
    }

    const duration =await getVideoDuration(videoFileUrl)

    if(!duration){
        new ApiError(500,"Couldent fetch video duration ")
    }

    const video = await Video.create({
        videoFile : videoFileUrl,
        thumbnail : thumbnailUrl,
        title,
        description,
        duration : duration,
        isPublished : true,
        owner : req.user
    })

    const uploadedVideo = await Video.findById(video._id)

    if(!uploadedVideo){
        new ApiError(500,"Somthing went wrong whilw uploading a video")
    }

    return res.status(201).json(
        new ApiResponse(201,uploadedVideo,"Video published successfully")
    )
})

const getAllVideos = asyncHandler(async (req,res,next)=>{
    const {query , userId} = req.query

    console.log("UserId",userId)

    const page = 1
    const limit = 10
    const sortBy = "title"
    const sortType = "asc"
    const skip = (page-1) * limit

    let videos
    if(query && userId){
        videos = await Video.find(
            {
                owner : userId,
                title : {
                    $regex : query,
                    $options : "i"
                }
            }
        ).sort({
            [sortBy] : sortType === "asc" ? 1 : -1
        })
        .skip(skip)
        .limit(limit)
    }else if(query){
        videos = await Video.find(
            {
                title:{
                    $regex : query,
                    $options : "i"
                }
            }
        ).sort({
            [sortBy] : sortType === "asc" ? 1 : -1
        })
        .skip(skip)
        .limit(limit)
    }else{
        videos = await Video.find(
            {
                owner : userId
            }
        ).sort({
            [sortBy] : sortType === "asc" ? 1 : -1
        }) 
        .skip(skip)
        .limit(limit)               
    }

    console.log("Videos",videos)
    res.status(201)
    .json(
        new ApiResponse(201,videos,"All videos has been successfully fetched")
    )
})

const getVideoById = asyncHandler(async (req,res,next)=>{
    const {videoId} = req.query

    if(!videoId){
        throw new ApiError(400,"Give a videoId")
    }

    const video = await Video.findById(videoId)

    if(!video){
        new ApiError(404,"Video not found")
    }    

    return res.status(201)
    .json(
        new ApiResponse(201,video,"Video successfully fetched")
    )

})

const updateVideoDetails = asyncHandler(async (req,res,next)=>{
    const {videoId,title,description} = req.body

    console.log("VideoId",videoId)
    if(videoId){
        new ApiError(401,"VideoId is required")
    }

    const thumbnailUrl = req.file.thumbnail?.location

    if(!thumbnailUrl){
        new ApiError(400,"Thumbnail is required")
    }

    const video = await Video.findByIdAndUpdate(videoId,{
        $set : {
            title,
            thumbnail : thumbnailUrl,
            description
        },
        new : true
    })

    console.log(video)

    if(!video){
        throw new ApiError(404,"Video not found")
    }

    return res.status(201)
    .json(
        new ApiResponse(201,video,"Video details updated successfully")
    )
})

const deleteVideo = asyncHandler(async (req,res,next)=>{
    const {videoId} = req.query

    if(!videoId){
        throw new ApiError(400,"Give a videoId")
    }
    
    const deletedVideo = await Video.findByIdAndDelete(videoId)

    if(!deletedVideo){
        throw new ApiError(404,"Video not found")
    }

    return res.status(201)
    .json(
        new ApiResponse(201,deletedVideo,"Video deleted succesfully")
    )
})

const toggalePublishStatus = asyncHandler(async (req,res,next)=>{
    const {videoId} = req.query

    if(!videoId){
        throw new ApiError(400,"Give a videoId")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(401,"Video not found")
    }

    video.isPublished = !video.isPublished

    await video.save()

    return res.status(201).json(
        new ApiResponse(201,video,"Publishe status updated successfully")
    )
})



export {
    publishOnVideoTube,
    getAllVideos,
    getVideoById,
    updateVideoDetails,
    deleteVideo,
    toggalePublishStatus
}