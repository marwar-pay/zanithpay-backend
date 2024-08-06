import express from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { allGeneratedPayment, generatePayment, paymentStatusCheck, paymentStatusUpdate, callBackResponse } from "../controllers/payIn.controller.js";
const router = express.Router();
import { celebrate, Joi } from "celebrate";

router.get("/allPaymentGenerated", asyncHandler(allGeneratedPayment));

router.post("/generatePayment", celebrate({
    body: Joi.object({
        memberId: Joi.string().required(),
        trxId: Joi.string().required(),
        trxPassword: Joi.string().required(),
        refId: Joi.string().optional(),
        amount: Joi.number().required(),
        name: Joi.string().required(),
    })
}), asyncHandler(generatePayment));

router.post("/paymentStatusCheck/:trxId", celebrate({
    params: Joi.object({
        trxId: Joi.string().trim().required(),
    })
}), asyncHandler(paymentStatusCheck));

router.post("/paymentStatusUpdate/:trxId", celebrate({
    body: Joi.object({
        callBackStatus: Joi.string().valid("Pending", "Failed", "Success").optional(),
    }),
    params: Joi.object({
        trxId: Joi.string().trim().required(),
    })
}), asyncHandler(paymentStatusUpdate));

router.post("/callBackResponse", asyncHandler(callBackResponse));

export default router;