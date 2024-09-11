import express from "express";
const router = express.Router();
import { celebrate, Joi } from "celebrate";
import { changePassword, updateProfile, userInfo } from "../../controllers/userPannelControllers/userHandleUser.controllers.js";

router.get("/userInfo", userInfo);

router.post("/changePassword", celebrate({
    body: Joi.object({
        packageName: Joi.string().required(),
        packageInfo: Joi.string().optional(),
        packagePayOutCharge: Joi.number().required(),
        packagePayInCharge: Joi.number().required(),
        isActive: Joi.boolean().optional(),
    })
}), changePassword);

router.post("/updateProfile", celebrate({
    body: Joi.object({
        packageName: Joi.string().required(),
        packageInfo: Joi.string().optional(),
        packagePayOutCharge: Joi.number().required(),
        packagePayInCharge: Joi.number().required(),
        isActive: Joi.boolean().optional(),
    })
}), updateProfile);

export default router;