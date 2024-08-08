import express from "express";
import { addPackage, deletePackage, getPackage, updatePackage } from "../controllers/package.controller.js";
import { userVerify} from "../middlewares/userAuth.js";
const router = express.Router();
import { celebrate, Joi } from "celebrate";

router.get("/allPackage", userVerify, getPackage);

router.post("/addPackage", celebrate({
    body: Joi.object({
        packageName: Joi.string().required(),
        packageInfo: Joi.string().optional(),
        isActive: Joi.boolean().optional(),
    })
}), addPackage);

router.post("/updatePackage/:id", celebrate({
    body: Joi.object({
        packageName: Joi.string().optional(),
        packageInfo: Joi.string().optional(),
        isActive: Joi.boolean().optional(),
    }),
    params: Joi.object({
        id: Joi.string().trim().required(),
    })
}), updatePackage);

router.delete("/deletePackage/:id", celebrate({
    params: Joi.object({
        id: Joi.string().trim().required(),
    })
}), deletePackage);

export default router;