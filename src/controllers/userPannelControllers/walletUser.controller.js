import { ApiResponse } from "../../utils/ApiResponse.js"
import walletModel from "../../models/qrGeneration.model.js"
import payInModelSuccess from "../../models/payIn.model.js"
import { asyncHandler } from "../../utils/asyncHandler.js"
import { ApiError } from "../../utils/ApiError.js"

export const upiWalletTrx = asyncHandler(async (req, res) => {
    res.status(200).json({ message: "Success" });
});

export const upiToEwalletTrx = asyncHandler(async (req, res) => {
    res.status(200).json({ message: "Success" });
});

export const eWalletToPayOutTrx = asyncHandler(async (req, res) => {
    res.status(200).json({ message: "Success" });
});