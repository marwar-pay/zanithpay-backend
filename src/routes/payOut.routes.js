import express from "express";
const router = express.Router();
import { celebrate, Joi } from "celebrate";
import { userVerify, userAuthAdmin } from "../middlewares/userAuth.js";
import { allPayOutPayment, generatePayOut, payoutCallBackResponse, payoutStatusCheck, payoutStatusUpdate } from "../controllers/payOut.controller.js";

router.get("/allPayOutPayment", userVerify, allPayOutPayment);

router.post("/generatePayOut", celebrate({
    body: Joi.object({
        memberId: Joi.string().required(),
        trxPassword: Joi.string().required(),
        mobileNumber:Joi.string().required(),
        accountHolderName:Joi.string().required(),
        accountNumber:Joi.string().required(),
        ifscCode:Joi.string().required(),
        trxId: Joi.string().required(),
        amount: Joi.number().required(),
    })
}), generatePayOut);

router.get("/payoutStatusCheck/:trxId", celebrate({
    params: Joi.object({
        trxId: Joi.string().trim().required(),
    })
}), payoutStatusCheck);

router.post("/payoutStatusUpdate/:trxId", celebrate({
    body: Joi.object({
        callBackStatus: Joi.string().valid("Pending", "Failed", "Success").required(),
    }),
    params: Joi.object({
        trxId: Joi.string().trim().required(),
    })
}), userVerify, userAuthAdmin, payoutStatusUpdate);

router.post("/payoutCallBackResponse", payoutCallBackResponse);

export default router;