import express from "express";
const router = express.Router();
import { celebrate, Joi } from "celebrate";
import { logInUserPannel, logOutUserPannel, updatePassword, updateProfile, updateTrxPassword, userInfo } from "../../controllers/userPannelControllers/userHandleUser.controllers.js";
import { userPannelAuth } from "../../middlewares/userPannelAuth.js";

router.get("/userInfo", userPannelAuth, userInfo);

router.post("/updateProfile", celebrate({
    body: Joi.object({
        fullName: Joi.string().optional(),
        mobileNumber: Joi.string().optional(),
        email: Joi.string().optional(),
    })
}), userPannelAuth, updateProfile);

router.post("/updatePassword", celebrate({
    body: Joi.object({
        currentPassword: Joi.string().required(),
        password: Joi.string().required(),
    })
}), userPannelAuth, updatePassword);

router.post("/updateTrxPassword", celebrate({
    body: Joi.object({
        currentPassword: Joi.string().required(),
        trxPassword: Joi.string().required(),
    })
}), userPannelAuth, updateTrxPassword);

router.post("/login", celebrate({
    body: Joi.object({
        userName: Joi.string().required(),
        password: Joi.string().required(),
    })
}), logInUserPannel);

router.get("/logout", userPannelAuth, logOutUserPannel);

export default router;