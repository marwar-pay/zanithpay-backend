import { ApiResponse } from "../../utils/ApiResponse.js"
import upiWalletModel from "../../models/upiWallet.model.js"
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
    // let userId = req.user._id;
    let userId = "66e3c96652dd4289ce776d04";
    let userUpiTrx = await eWalletModel.find({ memberId: userId });
    // if (userUpiTrx.length === 0) {
    //     return res.status(400).json({ message: "Failed", data: "No Trx Avabile !" })
    // }
    res.status(200).json(new ApiResponse(200, userUpiTrx));
});

export const eWalletToPayOutTrx = asyncHandler(async (req, res) => {
    res.status(200).json({ message: "Success" });
});