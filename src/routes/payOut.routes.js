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
        mobileNumber: Joi.string().required(),
        accountHolderName: Joi.string().required(),
        accountNumber: Joi.number().required(),
        ifscCode: Joi.string().required(),
        trxId: Joi.string().min(10).max(15).required(),
        amount: Joi.number().required(),
    })
}), generatePayOut);

router.get("/payoutStatusCheck/:trxId", celebrate({
    params: Joi.object({
        trxId: Joi.string().trim().min(10).max(15).required(),
    })
}), payoutStatusCheck);

router.post("/payoutStatusUpdate/:trxId", celebrate({
    body: Joi.object({
        isSuccess: Joi.string().valid("Pending", "Failed", "Success").required(),
    }),
    params: Joi.object({
        trxId: Joi.string().trim().min(10).max(15).required(),
    })
}), userVerify, userAuthAdmin, payoutStatusUpdate);

router.post("/payoutCallBackResponse", payoutCallBackResponse);

export default router;