import express from "express";
import { getUser, addUser,registerUser,loginUser } from "../controllers/user.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";
const router = express.Router();

// router.get("/users", asyncHandler(getUser)).post(("/users"),asyncHandler(addUser));

router.get("/getUsers", asyncHandler(getUser))
router.post("/addUser", asyncHandler(addUser))

router.post("/login", asyncHandler(loginUser))
router.post("/register", asyncHandler(registerUser))

export default router;