import express from "express";
const router = express.Router();
import { celebrate, Joi } from "celebrate";
import { userVerify } from "../../middlewares/userAuth.js";
import { addCallBackUrl, deleteCallBackUrl, getAllCallBackUrl, getCallBackUrl, updateCallBackUrl } from "../../controllers/adminPannelControllers/callBack.controller.js";

router.get("/allCallBackUrl", userVerify, getAllCallBackUrl);

router.get("/callBackUrl/:id", celebrate({
    params: Joi.object({
        id: Joi.string().trim().length(24).required(),
    })
}), userVerify, getCallBackUrl);

router.post("/addCallBackUrl", celebrate({
    body: Joi.object({
        memberId: Joi.string().trim().length(24).required(),
        payInCallBackUrl: Joi.string().required(),
        payOutCallBackUrl: Joi.string().required(),
        isActive: Joi.boolean().optional(),
    })
}), userVerify, addCallBackUrl);

router.post("/updateCallBackUrl/:id", celebrate({
    body: Joi.object({
        memberId: Joi.string().trim().length(24).optional(),
        payInCallBackUrl: Joi.string().optional(),
        payOutCallBackUrl: Joi.string().optional(),
        isActive: Joi.boolean().optional(),
    }),
    params: Joi.object({
        id: Joi.string().trim().length(24).required(),
    })
}), userVerify, updateCallBackUrl);

router.delete("/deleteCallBackUrl/:id", celebrate({
    params: Joi.object({
        id: Joi.string().trim().length(24).required(),
    })
}), userVerify, deleteCallBackUrl);

export default router;