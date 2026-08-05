import { Router } from "express";
import { veryfyJWT } from "../middlewares/auth.middleware.js";
import { getUserChannelSubscriber, subscribeChannel, toggleSubscription , subscribedChannel } from "../controllers/subscription.controller.js";

export const subscribeRouter = new Router()

subscribeRouter.use(veryfyJWT)

subscribeRouter.route("/subscribeChannel").post(subscribeChannel)

subscribeRouter.route("/toggleSubscription").patch(toggleSubscription)

subscribeRouter.route("/getUserChannelSubscriber").get(getUserChannelSubscriber)

subscribeRouter.route("/subscribedChannel").get(subscribedChannel)