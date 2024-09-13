import { ApiResponse } from "../../utils/ApiResponse.js"
import upiWalletModel from "../../models/upiWallet.model.js"
import eWalletModel from "../../models/Ewallet.model.js"
import payInModelSuccess from "../../models/payIn.model.js"
import { asyncHandler } from "../../utils/asyncHandler.js"
import { ApiError } from "../../utils/ApiError.js"

export const upiWalletTrx = asyncHandler(async (req, res) => {
    let userId = req.user._id
    console.log(userId)
    let userUpiTrx = await upiWalletModel.find({ memberId: userId });
    if (userUpiTrx.length === 0) {
        return res.status(400).json({ message: "Failed", data: "No Trx Avabile !" })
    }
    console.log(userUpiTrx)
    res.status(200).json({ message: "Success" });
});

export const eWalletTrx = asyncHandler(async (req, res) => {
    res.status(200).json({ message: "Success" });
});

export const upiToEwalletTrx = asyncHandler(async (req, res) => {
    res.status(200).json({ message: "Success" });
});

export const eWalletToPayOutTrx = asyncHandler(async (req, res) => {
    res.status(200).json({ message: "Success" });
});