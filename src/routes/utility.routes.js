import express from "express";
import { userVerify } from "../middlewares/userAuth.js";
import { getPackageList, getUserList } from "../controllers/utility.controller.js";
const router = express.Router();

router.get("/getUserList", userVerify, getUserList);

router.get("/getPackageList", userVerify, getPackageList);

export default router;