import express from "express";
const router = express.Router();
import { allPayInTransactionGeneration, allPayInTransactionSuccess, userPaymentStatusCheckPayIn } from "../../controllers/userPannelControllers/payInUser.controller.js";
import { userPannelAuth } from "../../middlewares/userPannelAuth.js";
import { celebrate, Joi } from "celebrate";

router.get("/getAllQrGenerated", userPannelAuth, allPayInTransactionGeneration);

router.get("/getAllPayInSuccess", userPannelAuth, allPayInTransactionSuccess);

router.post("/paymentStatusPayIn", celebrate({
    body: Joi.object({
        userName: Joi.string().required(),
        authToken: Joi.string().required(),
        trxId: Joi.string().min(10).max(25).required()
    })
}), userPaymentStatusCheckPayIn);

export default router;