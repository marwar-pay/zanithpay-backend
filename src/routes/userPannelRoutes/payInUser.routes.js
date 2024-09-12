import express from "express";
const router = express.Router();
import { allPayInTransactionGeneration, allPayInTransactionSuccess } from "../../controllers/userPannelControllers/payInUser.controller.js";
import { userPannelAuth } from "../../middlewares/userPannelAuth.js";

router.get("/getAllQrGenerated",userPannelAuth, allPayInTransactionGeneration);

router.get("/getAllPayInSuccess",userPannelAuth, allPayInTransactionSuccess);

export default router;