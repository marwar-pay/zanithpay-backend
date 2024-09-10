import express from "express";
import { userVerify } from "../middlewares/userAuth.js";
import { getPackageList, getPayInApiList, getPayOutApiList, getUserList } from "../controllers/utility.controller.js";
const router = express.Router();

router.get("/getUserList", userVerify, getUserList);

router.get("/getPackageList", userVerify, getPackageList);

router.get("/getPayInApiList", userVerify, getPayInApiList);

router.get("/getPayOutApiList", userVerify, getPayOutApiList);

export default router;