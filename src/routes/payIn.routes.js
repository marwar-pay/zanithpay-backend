import express from "express";
import { allGeneratedPayment, generatePayment, paymentStatusCheck, paymentStatusUpdate, callBackResponse } from "../controllers/payIn.controller.js";
const router = express.Router();
import { celebrate, Joi } from "celebrate";
import { userVerify,userAuthAdmin } from "../middlewares/userAuth.js";

router.get("/allPaymentGenerated",userVerify, allGeneratedPayment);

router.post("/generatePayment", celebrate({
    body: Joi.object({
        memberId: Joi.string().required(),
        trxId: Joi.string().min(10).max(15).required(),
        trxPassword: Joi.string().required(),
        refId: Joi.string().optional(),
        amount: Joi.number().required(),
        name: Joi.string().required(),
    })
}), generatePayment);

router.get("/paymentStatusCheck/:trxId", celebrate({
    params: Joi.object({
        trxId: Joi.string().trim().min(10).max(15).required(),
    })
}), paymentStatusCheck);

router.post("/paymentStatusUpdate/:trxId", celebrate({
    body: Joi.object({
        callBackStatus: Joi.string().valid("Pending", "Failed", "Success").required(),
    }),
    params: Joi.object({
        trxId: Joi.string().trim().min(10).max(15).required(),
    })
}), userVerify,userAuthAdmin, paymentStatusUpdate);

router.post("/callBackResponse", callBackResponse);

export default router;