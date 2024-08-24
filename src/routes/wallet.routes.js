import express from "express";
import { userVerify } from "../middlewares/userAuth.js";
const router = express.Router();
import { celebrate, Joi } from "celebrate";
import { getAllTransaction, upiToEwallet } from "../controllers/wallet.controller.js";

router.get("/getAllTransaction", userVerify, getAllTransaction);

router.post("/upiToEwallet/:id", celebrate({
    body: Joi.object({
        transactionType: Joi.string().valid("Cr.").required(),
        transactionAmount: Joi.number().required(),
    }),
    params: Joi.object({
        id: Joi.string().trim().length(24).required(),
    })
}), userVerify, upiToEwallet);

export default router;