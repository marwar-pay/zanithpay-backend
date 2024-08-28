import express from "express";
import { userVerify } from "../middlewares/userAuth.js";
const router = express.Router();
import { celebrate, Joi } from "celebrate";
import { getAllTransaction, getTransactionStatus, upiToEwallet } from "../controllers/wallet.controller.js";

router.get("/getAllTransaction", userVerify, getAllTransaction);

router.get("/getTransactionStatus/:id", celebrate({
    params: Joi.object({
        id: Joi.string().trim().length(24).required(),
    })
}), userVerify, getTransactionStatus);

router.post("/upiToEwallet/:id", celebrate({
    body: Joi.object({
        transactionType: Joi.string().default("Cr."),
        transactionAmount: Joi.number().required(),
    }),
    params: Joi.object({
        id: Joi.string().trim().length(24).required(),
    })
}), userVerify, upiToEwallet);

export default router;