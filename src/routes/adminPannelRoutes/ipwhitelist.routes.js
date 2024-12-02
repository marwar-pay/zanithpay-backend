import express from "express";
const router = express.Router();
import { celebrate, Joi } from "celebrate";
import { userVerify } from "../../middlewares/userAuth.js";
import { addUserIp, deleteUserIp, getSingleUserIp, getUserIp, updateUserIp } from "../../controllers/adminPannelControllers/ipWhitelist.controller.js";

router.get("/getUserIp", userVerify, getUserIp);

router.get("/getSingleUserIp/:id", celebrate({
    params: Joi.object({
        id: Joi.string().trim().length(24).required(),
    })
}), userVerify, getSingleUserIp);

router.post("/addUserIp", celebrate({
    body: Joi.object({
        memberId: Joi.string().required(),
        ipUser: Joi.string().required(),
        ipUserDev: Joi.string().optional(),
        isStatus: Joi.boolean().optional().default(true),
    })
}), userVerify, addUserIp);

router.post("/updateUserIp/:id", celebrate({
    body: Joi.object({
        memberId: Joi.string().trim().length(24).required(),
        ipUser: Joi.string().optional(),
        ipUserDev: Joi.string().optional(),
        isStatus: Joi.boolean().optional()
    }),
    params: Joi.object({
        id: Joi.string().trim().length(24).required(),
    })
}), userVerify, updateUserIp);

router.delete("/deleteUserIp/:id", celebrate({
    params: Joi.object({
        id: Joi.string().trim().length(24).required(),
    })
}), userVerify, deleteUserIp);

export default router;