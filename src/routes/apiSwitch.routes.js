import express from "express";
const router = express.Router();
import { celebrate, Joi } from "celebrate";
import { addApiPayIn, deleteApiPayIn, getAllApiPayIn, updateApiPayIn } from "../controllers/apiSwitch.controller.js";

router.get("/allPayInSwitch", getAllApiPayIn);

router.post("/addPayInSwitch", celebrate({
    body: Joi.object({
        apiName: Joi.string().required(),
        apiURL: Joi.string().required(),
        apiInfo: Joi.string().optional(),
        isActive: Joi.boolean().optional(),
    })
}), addApiPayIn);

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
}), updateApiPayIn);

router.delete("/deletePayInSwitch/:id", celebrate({
    params: Joi.object({
        id: Joi.string().trim().required(),
    })
}), deleteApiPayIn);

export default router;