import express from "express";
import { addPackage, addPayOutPackage, deletePackage, getPackage, getPayOutPackage, getSinglePackage, updatePackage, updatePayOutPackage } from "../../controllers/adminPannelControllers/package.controller.js";
import { userVerify } from "../../middlewares/userAuth.js";
const router = express.Router();
import { celebrate, Joi } from "celebrate";

const payoutCharge = Joi.object().keys({
    lowerLimit: Joi.number().required(),
    upperLimit: Joi.number().required(),
    chargeType: Joi.string().valid("Flat", "Percentage").required(),
    charge: Joi.number().required(),
})

router.get("/allPackage", userVerify, getPackage);

router.get("/getSinglePackage/:id", celebrate({
    params: Joi.object({
        id: Joi.string().trim().length(24).required(),
    })
}), userVerify, getSinglePackage);

router.post("/addPackage", celebrate({
    body: Joi.object({
        packageName: Joi.string().required(),
        packageInfo: Joi.string().optional(),
        packagePayOutCharge: Joi.string().trim().length(24).required(),
        packagePayInCharge: Joi.number().required(),
        isActive: Joi.boolean().optional(),
    })
}), userVerify, addPackage);

router.post("/updatePackage/:id", celebrate({
    body: Joi.object({
        packageName: Joi.string().optional(),
        packageInfo: Joi.string().optional(),
        packagePayOutCharge: Joi.string().trim().length(24).optional(),
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

router.get("/getPayOutPackage", userVerify, getPayOutPackage);

router.post("/addPayOutPackage", celebrate({
    body: Joi.object({
        payOutPackageName: Joi.string().required(),
        payOutChargeRange: Joi.array().items(payoutCharge).required(),
        isActive: Joi.boolean().default(true),
    })
}), userVerify, addPayOutPackage);

router.post("/updatePayOutPackage/:id", celebrate({
    body: Joi.object({
        payOutPackageName: Joi.string().optional(),
        payOutChargeRange: Joi.array().items(payoutCharge).optional(),
        isActive: Joi.boolean().optional(),
    }),
    params: Joi.object({
        id: Joi.string().trim().length(24).required(),
    })
}), userVerify, updatePayOutPackage);

export default router;