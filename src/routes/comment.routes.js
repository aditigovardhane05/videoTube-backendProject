import { addComment, deleteComment, getAllComments, updateComment } from "../controllers/comment.controller.js";
import { Router } from "express";
import { veryfyJWT } from "../middlewares/auth.middleware.js";

export const commentRouter = new Router()

commentRouter.use(veryfyJWT)

commentRouter.route("/getAllComments").get(getAllComments)

commentRouter.route("/addComment").post(addComment)

commentRouter.route("/updateComment").patch(updateComment)

commentRouter.route("/deleteComment").delete(deleteComment)
