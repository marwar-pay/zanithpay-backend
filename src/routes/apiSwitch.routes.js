import express from "express";
const router = express.Router();
import { celebrate, Joi } from "celebrate";
import { userVerify } from "../middlewares/userAuth.js";
import { addApiPayIn, deleteApiPayIn, getAllApiPayIn, updateApiPayIn } from "../controllers/apiSwitch.controller.js";

router.get("/allPayInSwitch",userVerify, getAllApiPayIn);

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
        id: Joi.string().trim().required(),
    })
}), userVerify,updateApiPayIn);

router.delete("/deletePayInSwitch/:id", celebrate({
    params: Joi.object({
        id: Joi.string().trim().required(),
    })
}),userVerify, deleteApiPayIn);

export default router;