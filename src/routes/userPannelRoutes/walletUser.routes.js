import express from "express";
const router = express.Router();
import { celebrate, Joi } from "celebrate";
import { allPayInTransactionGeneration, allPayInTransactionSuccess } from "../../controllers/userPannelControllers/payInUser.controller.js";

router.get("/getAllQrGenerated", allPayInTransactionGeneration);

router.get("/getAllPayInSuccess", allPayInTransactionSuccess);


export default router;