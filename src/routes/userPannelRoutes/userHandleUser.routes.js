import express from "express";
const router = express.Router();
import { celebrate, Joi } from "celebrate";
import { changePassword, logInUserPannel, logOutUserPannel, updateProfile, userInfo } from "../../controllers/userPannelControllers/userHandleUser.controllers.js";
import { userPannelAuth } from "../../middlewares/userPannelAuth.js";

router.get("/userInfo", userPannelAuth, userInfo);

router.post("/changePassword", celebrate({
    body: Joi.object({
        packageName: Joi.string().required(),
        packageInfo: Joi.string().optional(),
        packagePayOutCharge: Joi.number().required(),
        packagePayInCharge: Joi.number().required(),
        isActive: Joi.boolean().optional(),
    })
}), userPannelAuth, changePassword);

router.post("/updateProfile/:id", celebrate({
    body: Joi.object({
        fullName: Joi.string().optional(),
        mobileNumber: Joi.string().optional(),
        email: Joi.string().optional(),
    }),
    params: Joi.object({
        id: Joi.string().trim().length(24).required(),
    })
}), userPannelAuth, updateProfile);

router.post("/login", celebrate({
    body: Joi.object({
        userName: Joi.string().required(),
        password: Joi.string().required(),
    })
}), logInUserPannel);

router.get("/logout", userPannelAuth, logOutUserPannel);

export default router;