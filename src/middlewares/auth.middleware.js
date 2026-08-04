import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";

export const veryfyJWT=asyncHandler(async (req,res,next)=>{

    console.log("Cookies:", req.cookies);
    console.log("Authorization:", req.header("Authorization"));
   try {
     const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
 
     if(!token){
         throw new ApiError(401,"Unauthorized request")
     }
 
     const decodedToken = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET)

     console.log("Token extracted")
     const user =  await User.findById(decodedToken?._id).select("-password -refreshToken")
 
     if(!user){
         throw new ApiError(401,"Invalid access token")
     }
 
     req.user = user

     console.log("User",user)

     console.log("Calling next")
 
     next()
   } catch (error) {
        throw new ApiError(401,error?.message || "Invalid access token")
   }
})