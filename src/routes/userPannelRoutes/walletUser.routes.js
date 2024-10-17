import express from "express";
import { eWalletToPayOutTrx, eWalletTrx, upiToEwalletTrx, upiWalletTrx, walletBalanceAuth } from "../../controllers/userPannelControllers/walletUser.controller.js";
import { userPannelAuth } from "../../middlewares/userPannelAuth.js";
const router = express.Router();
import { celebrate, Joi } from "celebrate";

router.get("/upiWalletTrx", userPannelAuth, upiWalletTrx);

router.get("/eWalletTrx", userPannelAuth, eWalletTrx);

router.get("/upiToEwalletTrx", userPannelAuth, upiToEwalletTrx);

router.get("/eWalletToPayOutTrx", userPannelAuth, eWalletToPayOutTrx);

router.post("/walletBalance", celebrate({
    body: Joi.object({
        userName: Joi.string().required(),
        authToken: Joi.string().required(),
    })
}), walletBalanceAuth);

export default router;