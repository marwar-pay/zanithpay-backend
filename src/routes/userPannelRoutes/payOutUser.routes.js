import express from "express";
import { userPannelAuth } from "../../middlewares/userPannelAuth.js";
import { allPayOutTransactionGeneration, allPayOutTransactionSuccess } from "../../controllers/userPannelControllers/payOutUser.controller.js";
const router = express.Router();

router.get("/getAllPayOutGenerated", userPannelAuth, allPayOutTransactionGeneration);

router.get("/getAllPayOutSuccess", userPannelAuth, allPayOutTransactionSuccess);

export default router;