import express from "express";
import { addPackage, deletePackage, getPackage,updatePackage } from "../controllers/package.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";
const router = express.Router();

router.get("/allPackage", asyncHandler(getPackage));

router.post("/addPackage", asyncHandler(addPackage));

router.post("/updatePackage/:id", asyncHandler(updatePackage));

router.delete("/deletePackage/:id", asyncHandler(deletePackage));

export default router;