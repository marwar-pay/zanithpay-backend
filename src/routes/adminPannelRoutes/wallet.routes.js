import express from "express";
import { userVerify } from "../../middlewares/userAuth.js";
const router = express.Router();
import { celebrate, Joi } from "celebrate";
import { eWalletFundCredit, eWalletFundDebit, eWalletMemberHistory, getAllTransactionEwallet, getAllTransactionUpi, getTransactionStatus, upiToEwallet } from "../../controllers/adminPannelControllers/wallet.controller.js";

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

router.post("/eWalletFundCredit/:id", celebrate({
    body: Joi.object({
        transactionType: Joi.string().valid("Cr.").required(),
        transactionAmount: Joi.number().required(),
    }),
    params: Joi.object({
        id: Joi.string().trim().length(24).required(),
    })
}), userVerify, eWalletFundCredit);

router.post("/eWalletFundDebit/:id", celebrate({
    body: Joi.object({
        transactionType: Joi.string().valid("Dr.").required(),
        transactionAmount: Joi.number().required(),
    }),
    params: Joi.object({
        id: Joi.string().trim().length(24).required(),
    })
}), userVerify, eWalletFundDebit);

router.get("/eWalletMember/:id", celebrate({
    params: Joi.object({
        id: Joi.string().trim().length(24).required(),
    })
}), userVerify, eWalletMemberHistory);

export default router;