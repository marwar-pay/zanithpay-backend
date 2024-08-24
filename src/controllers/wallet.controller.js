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
    const { transactionAmount, transactionType } = req.body;
    let userData = await userDB.findById(query, "_id userName memberId upiWalletBalance EwalletBalance")
    if (!userData) {
        return res.status(404).json({ message: "Failed", data: "User not Found !" })
    }

    // Upi To Ewallet
    if (transactionAmount <= userData?.upiWalletBalance) {
        let beforeAmountEwallet = userData?.EwalletBalance;
        userData.upiWalletBalance -= transactionAmount;
        userData.EwalletBalance += transactionAmount;
        await userData.save();
        let trxStore = {
            memberId:userData._id,
            transactionType:transactionType,
            transactionAmount:transactionAmount,
            beforeAmount:beforeAmountEwallet,
            afterAmount:userData.EwalletBalance,
            description:`Successfully ${transactionType} amount: ${transactionAmount}`,
            transactionStatus:"Success",
        }
        let walletStore = await walletModel.create(trxStore);
        res.status(200).json({ message: "Success", data: walletStore })
    } else {
        res.status(400).json({ message: "Failed", data: "Transaction amount grather then upi Wallet amount !" })
    }
});