import express from "express";
import { userVerify } from "../../middlewares/userAuth.js";
import { getAllGenTicketList, getAllMemberList, getPackageList, getPayInApiList, getPayOutApiList, getPendingTicketList, getUserList, getUserListWithWallet } from "../../controllers/adminPannelControllers/utility.controller.js";
const router = express.Router();

router.get("/getUserList", userVerify, getUserList);

router.get("/getAllMemberList", userVerify, getAllMemberList);

router.get("/getUserWithWallet", userVerify, getUserListWithWallet);

router.get("/getPackageList", userVerify, getPackageList);

router.get("/getPayInApiList", userVerify, getPayInApiList);

router.get("/getPayOutApiList", userVerify, getPayOutApiList);

router.get("/getAllGenTicketList", userVerify, getAllGenTicketList);

router.get("/getPendingTicketList", userVerify, getPendingTicketList);

export default router;