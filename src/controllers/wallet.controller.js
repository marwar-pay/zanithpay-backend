import walletModel from "../models/wallet.model.js";
import userDB from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getAllTransaction = asyncHandler(async (req, res) => {
    let pack = await walletModel.find();
    res.status(200).json({
        message: "Sucess",
        data: pack
    })
})

export const upiToEwallet = asyncHandler(async (req, res) => {
    let query = req.params.id;
    let userData = await userDB.findById(query,"_id userName memberId upiWalletBalance EwalletBalance")
    if (!userData) {
        return res.status(404).json({ message: "Failed",data:"User not Found !" })
    }
    res.status(200).json({ message: "Sucess", data: userData })
})

export const eWalletToUpiWallet = asyncHandler(async (req, res) => {
        let query = req.params.id;
        let quaryFind = await packageModel.findByIdAndDelete(query)
        if (!quaryFind) {
            res.status(404).json({ message: "Faild", data: "Package not found !" })
        }
        res.status(200).json({
            message: "Sucess",
            data: quaryFind
        })
})