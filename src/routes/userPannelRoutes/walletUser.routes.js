import express from "express";
import { eWalletToPayOutTrx, upiToEwalletTrx, upiWalletTrx } from "../../controllers/userPannelControllers/walletUser.controller.js";
const router = express.Router();

router.get("/upiWalletTrx", upiWalletTrx);

router.get("/upiToEwalletTrx", upiToEwalletTrx);

router.get("/eWalletToPayOutTrx", eWalletToPayOutTrx);

export default router;