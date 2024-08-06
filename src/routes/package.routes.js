import express from "express";
import { addPackage, deletePackage, getPackage, updatePackage } from "../controllers/package.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { userAuth } from "../middlewares/userAuth.js";
const router = express.Router();
import { celebrate, Joi } from "celebrate";

router.get("/allPackage", userAuth, asyncHandler(getPackage));

router.post("/addPackage", celebrate({
    body: Joi.object({
        packageName: Joi.string().required(),
        packageInfo: Joi.string().optional(),
        isActive: Joi.boolean().optional(),
    })
}), asyncHandler(addPackage));

router.post("/updatePackage/:id", celebrate({
    body: Joi.object({
        packageName: Joi.string().optional(),
        packageInfo: Joi.string().optional(),
        isActive: Joi.boolean().optional(),
    }),
    params: Joi.object({
        id: Joi.string().trim().required(),
    })
}), asyncHandler(updatePackage));

router.delete("/deletePackage/:id", celebrate({
    params: Joi.object({
        id: Joi.string().trim().required(),
    })
}), asyncHandler(deletePackage));

export default router;