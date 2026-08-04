import { 
  deleteVideo, 
  getAllVideos, 
  getVideoById, 
  publishOnVideoTube, 
  toggalePublishStatus, 
  updateVideoDetails 
} from "../controllers/video.controller.js";
import { Router } from "express";
import { veryfyJWT } from "../middlewares/auth.middleware.js";
import upload from "../config/multerS3Config.js";

export const videoRouter = Router()

videoRouter.use(veryfyJWT)

videoRouter.route("/publishOnVideoTube").post(upload.fields(
    [
      {
        name : "thumbnail",
        maxCount : 1
      },
      {
        name : "videoFile",
        maxCount : 1
      }  
    ]
),publishOnVideoTube)

videoRouter.route("/getAllVideos").get(getAllVideos)

videoRouter.route("/getVideoById").get(getVideoById)

videoRouter.route("/updateVideoDetails").patch(upload.single("thumbnail"),updateVideoDetails)

videoRouter.route("/deleteVideo").delete(deleteVideo)

videoRouter.route("/toggalePublishStatus").patch(toggalePublishStatus)


