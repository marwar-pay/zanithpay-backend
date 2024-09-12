import express from "express";
import { addPackage, deletePackage, getPackage, updatePackage } from "../../controllers/adminPannelControllers/package.controller.js";
import { userVerify } from "../../middlewares/userAuth.js";
const router = express.Router();
import { celebrate, Joi } from "celebrate";

router.get("/allPackage", userVerify, getPackage);

router.post("/addPackage", celebrate({
    body: Joi.object({
        packageName: Joi.string().required(),
        packageInfo: Joi.string().optional(),
        packagePayOutCharge: Joi.number().required(),
        packagePayInCharge: Joi.number().required(),
        isActive: Joi.boolean().optional(),
    })
}), userVerify, addPackage);

router.post("/updatePackage/:id", celebrate({
    body: Joi.object({
        packageName: Joi.string().optional(),
        packageInfo: Joi.string().optional(),
        packagePayOutCharge: Joi.number().optional(),
        packagePayInCharge: Joi.number().optional(),
        isActive: Joi.boolean().optional(),
    }),
    params: Joi.object({
        id: Joi.string().trim().length(24).required(),
    })
}), userVerify, updatePackage);

router.delete("/deletePackage/:id", celebrate({
    params: Joi.object({
        id: Joi.string().trim().length(24).required(),
    })
}), userVerify, deletePackage);

export default router;