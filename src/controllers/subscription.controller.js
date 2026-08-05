import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";

const subscribeChannel = asyncHandler(async(req,res,next)=>{
    const {channelId} = req.query

    if(!channelId){
        throw new ApiError(401,"ChannelId is required")
    }

    const subscription = await Subscription.create(
        {
            subscriber : req.user,
            channel : channelId
        }
    )

    if(subscription){
        new ApiResponse(201,"Channel is already subscribed")
    }else{
        new ApiError(501,"Failed to subscribe the channel")
    }

    res.status(201).json(
        new ApiResponse(201,subscription,"Subscribed channel successfully")
    )
})


const toggleSubscription = asyncHandler(async(req,res,next)=>{
    const {channelId} = req.query

    if(!channelId){
        throw new ApiError(401,"ChannelId is required")
    }

    const subscription = await Subscription.findOne({
                subscriber : req.user._id,
                channel : channelId          
    })

    try {
        if(subscription){
            const unSubscribedChannel =  await Subscription.deleteOne(
                {
                    subscriber : req.user._id,
                    channel : channelId                
                }
            )
            res.status(201).json(
                new ApiResponse(201,unSubscribedChannel,"Unsubscribed channel successfully")
            )        
        }else{
            const subscribedChannel = await Subscription.create(
                {
                    subscriber : req.user._id,
                    channel : channelId
                }
            )
    
            res.status(201).json(
                new ApiResponse(201,subscribedChannel,"Subscribed channel successfully")
            )
        }
    } catch (error) {
        throw new ApiError(error)
    }


})

const getUserChannelSubscriber = asyncHandler(async(req,res,next)=>{
    const {channelId} = req.query
    if(!channelId){
        throw new ApiError(401,"ChannelId is required")
    }

    const [mySubscribers,userSubscribers]= await Promise.all(
        [
            Subscription.find({channel : req.user._id}),
            Subscription.find({channel : channelId})
        ]
    )

    console.log(mySubscribers)
    console.log(userSubscribers)
    res.status(201).json(
        new ApiResponse(201,{mySubscribers,userSubscribers},"Subscribers found")
    )
})

const subscribedChannel = asyncHandler(async (req,res,next)=>{
    const {subscriberId} = req.query

    if(!subscriberId){
        throw new ApiError(401,"subscriberId is required")
    }   
    
    const subscribers = await Subscription.find({
        subscriber : subscriberId
    })

    if(!subscribers){
        throw new ApiError(501,"Couldnt find subscribers")
    }

    res.status(201).json(
        new ApiResponse(201,subscribers,"Successfully found subscribed channels")
    )      
})
export {
    subscribeChannel,
    toggleSubscription,
    getUserChannelSubscriber,
    subscribedChannel
}