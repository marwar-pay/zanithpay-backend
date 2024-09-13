import express from "express";
import { userVerify } from "../../middlewares/userAuth.js";
const router = express.Router();
import { celebrate, Joi } from "celebrate";
import { getAllTransactionEwallet, getAllTransactionUpi, getTransactionStatus, upiToEwallet } from "../../controllers/adminPannelControllers/wallet.controller.js";

router.get("/getAllTransactionUpi", userVerify, getAllTransactionUpi);

router.get("/getAllTransactionEwallet", userVerify, getAllTransactionEwallet);

router.get("/getTransactionStatus/:id", celebrate({
    params: Joi.object({
        id: Joi.string().trim().length(24).required(),
    })
}), userVerify, getTransactionStatus);

router.post("/upiToEwallet/:id", celebrate({
    body: Joi.object({
        transactionAmount: Joi.number().required(),
    }),
    params: Joi.object({
        id: Joi.string().trim().length(24).required(),
    })
}), userVerify, upiToEwallet);

export default router;