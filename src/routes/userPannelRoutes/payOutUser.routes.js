import express from "express";
import { userPannelAuth } from "../../middlewares/userPannelAuth.js";
import { allPayOutTransactionGeneration, allPayOutTransactionSuccess, userPaymentStatusCheckPayOUt } from "../../controllers/userPannelControllers/payOutUser.controller.js";
const router = express.Router();
import { celebrate, Joi } from "celebrate";

router.get("/getAllPayOutGenerated", userPannelAuth, allPayOutTransactionGeneration);

router.get("/getAllPayOutSuccess", userPannelAuth, allPayOutTransactionSuccess);

router.post("/paymentStatusPayOut", celebrate({
    body: Joi.object({
        userName: Joi.string().required(),
        authToken: Joi.string().required(),
        trxId: Joi.string().min(10).max(25).required()
    })
}), userPaymentStatusCheckPayOUt);

export default router;