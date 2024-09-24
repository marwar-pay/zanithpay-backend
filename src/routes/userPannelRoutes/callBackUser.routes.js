import express from "express";
const router = express.Router();
import { celebrate, Joi } from "celebrate";
import { userPannelAuth } from "../../middlewares/userPannelAuth.js";
import { addCallBackUrl, getCallBackUrl, updateCallBackUrl } from "../../controllers/userPannelControllers/callBackUser.controller.js";

router.post("/addCallBackUrl", celebrate({
    body: Joi.object({
        payInCallBackUrl: Joi.string().optional(),
        payOutCallBackUrl: Joi.string().optional(),
    })
}), userPannelAuth, addCallBackUrl);

router.get("/getCallBackUrl", userPannelAuth, getCallBackUrl);

router.post("/updateCallBackUrl", celebrate({
    body: Joi.object({
        payInCallBackUrl: Joi.string().optional(),
        payOutCallBackUrl: Joi.string().optional(),
        isActive: Joi.boolean().optional(),
    })
}), userPannelAuth, updateCallBackUrl);

export default router;