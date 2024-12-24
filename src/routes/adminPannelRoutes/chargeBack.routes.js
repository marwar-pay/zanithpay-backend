import express from "express";
import { userVerify } from "../../middlewares/userAuth.js";
const router = express.Router();
import { celebrate, Joi } from "celebrate";
import { generateChargeBack, getAllChargeBack } from "../../controllers/adminPannelControllers/chargeBack.controller.js";

router.get("/getAllChargeBack", userVerify, getAllChargeBack);

router.post("/generateChargeBack", celebrate({
    body: Joi.object({
        trxId: Joi.string().min(10).max(25).required(),
    }),
}), userVerify, generateChargeBack);

export default router;