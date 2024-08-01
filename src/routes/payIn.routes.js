import express from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { allGeneratedPayment, generatePayment, paymentStatusCheck, paymentStatusUpdate } from "../controllers/payIn.controller.js";
const router = express.Router();

router.get("/allPaymentGenerated", asyncHandler(allGeneratedPayment));
router.post("/generatePayment", asyncHandler(generatePayment));
router.post("/paymentStatusCheck/:id", asyncHandler(paymentStatusCheck));
router.post("/paymentStatusUpdate/:id", asyncHandler(paymentStatusUpdate));

export default router;