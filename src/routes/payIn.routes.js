import express from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { allGeneratedPayment, generatePayment, paymentStatusCheck, paymentStatusUpdate,callBackResponse } from "../controllers/payIn.controller.js";
const router = express.Router();

router.get("/allPaymentGenerated", asyncHandler(allGeneratedPayment));
router.post("/generatePayment", asyncHandler(generatePayment));
router.post("/paymentStatusCheck/:trxId", asyncHandler(paymentStatusCheck));
router.post("/paymentStatusUpdate/:trxId", asyncHandler(paymentStatusUpdate));
router.post("/callBackResponse", asyncHandler(callBackResponse));

export default router;