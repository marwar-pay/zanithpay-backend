import express from "express";
import { addPackage, getPackage } from "../controllers/package.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";
const router = express.Router();

router.get("/allPackage", asyncHandler(getPackage)).post("/addPackage", asyncHandler(addPackage));

export default router;