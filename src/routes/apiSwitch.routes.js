import express from "express";
const router = express.Router();
import { celebrate, Joi } from "celebrate";
import { userVerify } from "../middlewares/userAuth.js";
import { addApiPayIn, addApiPayOut, deleteApiPayIn, deleteApiPayOut, getAllApiPayIn, getAllApiPayOut, updateApiPayIn, updateApiPayOut } from "../controllers/apiSwitch.controller.js";

router.get("/allPayInSwitch", userVerify, getAllApiPayIn);

router.post("/addPayInSwitch", celebrate({
    body: Joi.object({
        apiName: Joi.string().required(),
        apiURL: Joi.string().required(),
        apiInfo: Joi.string().optional(),
        isActive: Joi.boolean().optional(),
    })
}), userVerify, addApiPayIn);

router.post("/updatePayInSwitch/:id", celebrate({
    body: Joi.object({
        apiName: Joi.string().optional(),
        apiURL: Joi.string().optional(),
        apiInfo: Joi.string().optional(),
        isActive: Joi.boolean().optional(),
    }),
    params: Joi.object({
        id: Joi.string().trim().length(24).required(),
    })
}), userVerify, updateApiPayIn);

router.delete("/deletePayInSwitch/:id", celebrate({
    params: Joi.object({
        id: Joi.string().trim().length(24).required(),
    })
}), userVerify, deleteApiPayIn);

router.get("/allPayOutSwitch", userVerify, getAllApiPayOut);

router.post("/addPayOutSwitch", celebrate({
    body: Joi.object({
        apiName: Joi.string().required(),
        apiURL: Joi.string().required(),
        apiInfo: Joi.string().optional(),
        isActive: Joi.boolean().optional(),
    })
}), userVerify, addApiPayOut);

router.post("/updatePayOutSwitch/:id", celebrate({
    body: Joi.object({
        apiName: Joi.string().optional(),
        apiURL: Joi.string().optional(),
        apiInfo: Joi.string().optional(),
        isActive: Joi.boolean().optional(),
    }),
    params: Joi.object({
        id: Joi.string().trim().length(24).required(),
    })
}), userVerify, updateApiPayOut);

router.delete("/deletePayOutSwitch/:id", celebrate({
    params: Joi.object({
        id: Joi.string().trim().length(24).required(),
    })
}), userVerify, deleteApiPayOut);

export default router;