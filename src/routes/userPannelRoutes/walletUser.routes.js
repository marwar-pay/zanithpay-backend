import express from "express";
import { eWalletToPayOutTrx, eWalletTrx, upiToEwalletTrx, upiWalletTrx } from "../../controllers/userPannelControllers/walletUser.controller.js";
import { userPannelAuth } from "../../middlewares/userPannelAuth.js";
const router = express.Router();

router.get("/upiWalletTrx",userPannelAuth, upiWalletTrx);

router.get("/eWalletTrx",userPannelAuth, eWalletTrx);

router.get("/upiToEwalletTrx",userPannelAuth, upiToEwalletTrx);

router.get("/eWalletToPayOutTrx",userPannelAuth, eWalletToPayOutTrx);

export default router;