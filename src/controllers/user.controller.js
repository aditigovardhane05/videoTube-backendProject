import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { response } from "express";
const registerUser = asyncHandler(async (req,res)=>{

    const {userName,email,fullName,password}=req.body
    console.log("Email",email)

    if([userName,email,fullName,password].some((field)=>field?.trim()==="")){
        throw new ApiError(400,"All fields are required")
    }

    const existedUser = User.findOne({
        $or:[{userName},{email}]
    })

    if(existedUser){
        throw new ApiError(409,"Username or email already exists")
    }

    const avatarLocalPath=req.files?.avatar[0]?.path
    const coverImageLocalPath=req.files?.coverImage[0]?.path

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar is compulsory needed")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400,"Avatar file is compulsory needed")
    }

    const user = await User.create({
        fullName,
        avatar:avatar.url(),
        coverImage:coverImage.url,
        userName:userName.toLowerCase(),
        email,
        password
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering a user")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered successfully,")
    )
})

export {registerUser}


