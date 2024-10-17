import { ApiResponse } from "../../utils/ApiResponse.js"
import upiWalletModel from "../../models/upiWallet.model.js"
import userDB from "../../models/user.model.js"
import eWalletModel from "../../models/Ewallet.model.js"
import { asyncHandler } from "../../utils/asyncHandler.js"
import { ApiError } from "../../utils/ApiError.js"

export const upiWalletTrx = asyncHandler(async (req, res) => {
    let userId = req.user._id
    let userUpiTrx = await upiWalletModel.find({ memberId: userId });
    if (userUpiTrx.length === 0) {
        return res.status(400).json({ message: "Failed", data: "No Trx Avabile !" })
    }
    res.status(200).json(new ApiResponse(200, userUpiTrx));
});

export const eWalletTrx = asyncHandler(async (req, res) => {
    let userId = req.user._id;
    let userUpiTrx = await eWalletModel.find({ memberId: userId });
    if (userUpiTrx.length === 0) {
        return res.status(400).json({ message: "Failed", data: "No Trx Avabile !" })
    }
    res.status(200).json(new ApiResponse(200, userUpiTrx));
});

export const upiToEwalletTrx = asyncHandler(async (req, res) => {
    let userId = req.user._id;
    let userUpiTrx = await upiWalletModel.find({ memberId: userId, transactionType: "Dr." });
    if (userUpiTrx.length === 0) {
        return res.status(400).json({ message: "Failed", data: "No Trx Avabile !" })
    }
    res.status(200).json(new ApiResponse(200, userUpiTrx));
});

export const eWalletToPayOutTrx = asyncHandler(async (req, res) => {
    let userId = req.user._id;
    let userUpiTrx = await eWalletModel.find({ memberId: userId, transactionType: "Dr." });
    if (userUpiTrx.length === 0) {
        return res.status(400).json({ message: "Failed", data: "No Trx Avabile !" })
    }
    res.status(200).json(new ApiResponse(200, userUpiTrx));
});

export const walletBalanceAuth = asyncHandler(async (req, res) => {
    const { userName, authToken } = req.body;
    let user = await userDB.findOne({ userName: userName, trxAuthToken: authToken, isActive: true });
    if (!user) {
        return res.status(401).json({ message: "Failed", data: "Invalid Credential !" })
    }

    let userResp = {
        status_code: 200,
        status_msg: "OK",
        e_wallet_balance: user?.EwalletBalance,
        upi_wallet_balance: user?.upiWalletBalance
    }
    res.status(200).json(new ApiResponse(200, userResp));
});