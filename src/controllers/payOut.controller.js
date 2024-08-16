import axios from "axios";
import userDB from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const allPayOutPayment = asyncHandler(async (req, res) => {
    res.status(200).json({ message: "Success" })
});

export const generatePayOut = asyncHandler(async (req, res) => {
    res.status(200).json({ message: "Success" })
});

export const payoutStatusCheck = asyncHandler(async (req, res) => {
    res.status(200).json({ message: "Success" })
});

export const payoutStatusUpdate = asyncHandler(async (req, res) => {
    res.status(200).json({ message: "Success" })
});

export const payoutCallBackResponse = asyncHandler(async (req, res) => {
    res.status(200).json({ message: "Success" })
});