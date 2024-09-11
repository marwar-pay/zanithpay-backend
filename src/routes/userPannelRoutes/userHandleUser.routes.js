import express from "express";
const router = express.Router();
import { celebrate, Joi } from "celebrate";
import { changePassword, logIn, updateProfile, userInfo } from "../../controllers/userPannelControllers/userHandleUser.controllers.js";

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

router.post("/updateProfile/:id", celebrate({
    body: Joi.object({
        fullName: Joi.string().optional(),
        mobileNumber: Joi.string().optional(),
        email: Joi.number().optional(),
    }),
    params: Joi.object({
        id: Joi.string().trim().length(24).required(),
    })
}), updateProfile);

router.post("/login", celebrate({
    body: Joi.object({
        userName: Joi.string().required(),
        password: Joi.string().required(),
    })
}), logIn);

export default router;