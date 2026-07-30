import jwt from "jsonwebtoken"
import { ApiResponse } from "../utils/apiResponse.js";
import { response } from "express";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import upload from "../config/multerS3Config.js";
import mongoose from "mongoose";

const generateAccessAndRefreshToken = async(userId)=>{
    try{
        const user = await User.findById(userId)

        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave:false})

        return {accessToken,refreshToken}
    }catch(error){
        throw new ApiError(500,"Something went wrong while genrating tokens")
    }
} 

const registerUser = asyncHandler( async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    console.log(req.body)
    const {fullName, email, userName, password } = req.body
    //console.log("email: ", email);

    if (
        [fullName, email, userName, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ userName }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }
    //console.log(req.files);

    const avatarLocation = req.files?.avatar?.[0]?.location;
    const coverImageLocation = req.files?.coverImage?.[0]?.location;

    if (!avatarLocation) {
        throw new ApiError(400, "Avatar file is required")
    }
   
    const user = await User.create({
        fullName,
        avatar: avatarLocation,
        coverImage: coverImageLocation || "",
        email, 
        password,
        userName: userName.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )
})

const loginUser = asyncHandler(async(req,res)=>{
    const {userName , email , password} = req.body

    if(!(userName || email)){
        throw new ApiError(400,"Username or email is required")
    }

    const user = await User.findOne({
        $or:[{userName},{email}]
    })

    if(!user){
        throw new ApiError(404,"User does not exits")
    }

    const isPasswordValid = await user.isPasswordCorrect(req.body.password)

    if(!isPasswordValid){
        throw new ApiError(401,"Password is  not valid")
    }    

    const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id)

    console.log(accessToken)
    console.log(refreshToken)
    const loggedInuser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpsOnly:true,
        secure:true
    }
    res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
        200,
        {
            user:{loggedInuser,accessToken,refreshToken}
        },
        "User logged in successfully"
    )
    )
})

const logOutUser = asyncHandler(async (req,res)=>{
    User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refrehToken:undefined
            },
        },
        {
            new:true
        }
    )

    const options = {
        httpsOnly:true,
        secure:true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new ApiResponse(200,{},"User logged out successfully")
    )
})

const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    console.log("Refresh Token -> ",incomingRefreshToken)

    if(!incomingRefreshToken){
        new ApiError(401,"Unauthorised request")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id)
    
        if(!user){
            new ApiError(401,"Unauthorised token")
        }
    
        if(decodedToken !== user?.refreshToken){
            new ApiError(401,"RefreshToken is expired or used")
        }
    
        const options ={
            httpOnly:true,
            secure:true
        }
    
        const {accessToken,newRefreshToken} = await generateAccessAndRefreshToken(user._id)
    
        return res.status(200)
        .cookies("accesstoken",accessToken)
        .cookies("refreshtoken",newRefreshToken)
        .json(
            new ApiResponse(200,{accessToken,newRefreshToken},"Access token refreshed")
        )
    } catch (error) {
        new ApiError(401,error.message || "Invalid refresh token")
    }
})

const changeCurrentPassword = asyncHandler(async(req,res)=>{
    const {oldPassword , newPassword} = req.body

    const user = await User.findById(req.body.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(400,"Invalid old password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave:flse})

    return res.status(200).json(
        new ApiResponse(200,{},"Password changed successfully")
    )
})

const getCurrentUser = asyncHandler(async(req,res)=>{
    return res.status(200).json(200,req.user,"Current User fetctched successfully")
})

const updateAccountDetails = asyncHandler(async(req,res)=>{
    const {fullName , email}=req.body

    if(!fullName || !email){
        throw new ApiError(400,"All fields are required")
    }

    const user =await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullName,
                email
            }
        },
        {new:true}
    ).select("-password")

    console.log(user)

    return res.status(200).json(
        new ApiResponse(200,user,"Acount details updated successfully")
    )
})

const updateUserAvatar = asyncHandler(async(req,res)=>{
    
    const newAvatarPath = req.file?.location

    if(!newAvatarPath){
        throw new ApiError(400,"Avatar image is missing")
    }

    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set:{
                avatar:newAvatarPath
            }
        },
        {new:true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200,user,"Avatar updated successfully")
    )
    
})

const updateCoverImage = asyncHandler(async(req,res)=>{
    const newCoverImagePath = req.file?.location

    if(!newCoverImagePath){
        throw new ApiError(400,"CoverImage is missing")
    }

    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set:{
                coverImage:newCoverImagePath
            }
        },
        {
            new:true
        }
    )

    return res
    
    .status(200)
    .json(
        new ApiResponse(200,user,"CoverImage updated successfully")
    )
})

const getUserChannelProfile = asyncHandler(async(req,res)=>{
    const {userName} = req.params

    if(!userName?.trim()){
        throw new ApiError(400,"Username not defined")
    }

    const channel = await User.aggregate([
        {
            $match : {
                userName : userName?.toLowerCase(),
            }
        },
        {
            $lookup:{
                from:"subscription",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"
            }
        },
        {
            $lookup:{
                from:"subscription",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribedTo"
            }
        },
        {
            $addFields:{
                subscribersCount : "$subscribers",
                channelsSubscribedToCount:"$subscribedTo",
                isSubscribed : {
                    $cond : {
                        if : {$in : [req.user?._id , "$subscribers.subscriber"]},
                        then:true,
                        else:false
                    }
                }
            }
        },
        {
            $project:{
                fullName:1,
                userName:1,
                subscribersCount:1,
                channelsSubscribedToCount:1,
                isSubscribed:1,
                avatar:1,
                coverImage:1,
                email:1
            }
        }
    ])

    if(!channel?.length){
        throw new ApiError(404,"Channel does not exist")
    }

    return res.status(200)
    .json(
        new ApiResponse(200,channel[0],"Channel fetched successfully")
    )
})

const getWatchHistory = asyncHandler(async(req,res)=>{
    const user = await User.aggregate([
        {
            $match : {
                _id : new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup : {
                from : "videos",
                localField : "watchHistory",
                foreignField : "_id",
                as : "watchHistory",
                pipeline : 
                [    {
                        $lookup :{
                            from : "users",
                            localField : "owner",
                            foreignField : "_id",
                            as : "owner",
                            pipeline : [
                                {
                                    $project :{
                                        fullName : 1,
                                        userName : 1,
                                        avatar : 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields : {
                            owner : {
                                $first : "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    res.status(200)
    .json(
        new ApiResponse(200,user[0].watchHistory,"Watch history fetched successfully")
    )
})
export {
    registerUser ,
    loginUser , 
    logOutUser ,
    refreshAccessToken ,
    changeCurrentPassword , 
    getCurrentUser , 
    updateAccountDetails , 
    updateUserAvatar,
    updateCoverImage,
    getUserChannelProfile,
    getWatchHistory
}



