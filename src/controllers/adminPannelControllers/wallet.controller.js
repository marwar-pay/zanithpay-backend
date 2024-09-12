import walletModel from "../../models/wallet.model.js";
import userDB from "../../models/user.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

export const getAllTransaction = asyncHandler(async (req, res) => {
    let pack = await walletModel.aggregate([{ $lookup: { from: "users", localField: "memberId", foreignField: "_id", as: "userInfo" } }, {
        $unwind: {
            path: "$userInfo",
            preserveNullAndEmptyArrays: true,
        }
    },{$project:{"_id":1,"memberId":1,"transactionType":1,"transactionAmount":1,"beforeAmount":1,"afterAmount":1,"description":1,"transactionStatus":1,"createdAt":1,"updatedAt":1,"userInfo._id":1,"userInfo.userName":1,"userInfo.memberId":1}}]);
    if (!pack) {
        return res.status(200).json({ message: "Success", data: "No Transaction Avabile!" })
    }
    res.status(200).json(new ApiResponse(200, pack))
})

export const getTransactionStatus = asyncHandler(async (req, res) => {
    let query = req.params.id;
    let pack = await walletModel.findById(query);
    if (!pack) {
        return res.status(400).json({ message: "Failed", data: "No Transaction Found!" })
    }
    res.status(200).json(new ApiResponse(200, pack))
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
            memberId: userData._id,
            transactionType: transactionType,
            transactionAmount: transactionAmount,
            beforeAmount: beforeAmountEwallet,
            afterAmount: userData.EwalletBalance,
            description: `Successfully ${transactionType} amount: ${transactionAmount}`,
            transactionStatus: "Success",
        }
        let walletStore = await walletModel.create(trxStore);
        res.status(200).json(new ApiResponse(200, walletStore))
    } else {
        res.status(400).json({ message: "Failed", data: `Transaction amount grather then upi Wallet Amount : ${userData.upiWalletBalance} !` })
    }
});