import mongoose , {Schema} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new Schema({
    userName:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true
    },

    email:{
        type:String,
        required:true,
        lowercase:true,
        unique:true,
        trim:true
    },

    fullName:{
        type:String,
        required:true,
        lowercase:true,
        trim:true,
        index:true
    },

    avatar:{
        type:String,
        required:true
    },

    coverImage:{
        type:String
    },

    watchHistory:[
        {
         type:Schema.Types.ObjectId,
         ref:"Video"
        }
    ],

    password:{
        type:String,
        required:[true,"Password is required"]
    },

    refreshToken:{
        type:String
    }
},{timestamps:true})

userSchema.pre("save",async function(next){
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password,10)
        next()
    }  
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken = async function(){
    return await jwt.sign(
    {
        _id:this.id,
        email:this.email,
        userName:this.userName,
        fullName:this.fullName
    },
    process.env.ACCESS_TOKEN_EXPIRY,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
    )
}

userSchema.methods.generateRefreshToken = async function(){
    return await jwt.sign(
    {
        _id:this.id
    },
    process.env.REFRESH_TOKEN_EXPIRY,
    {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }
    )
}

export const User = mongoose.model("User",userSchema)
