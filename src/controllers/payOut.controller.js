import axios from "axios";
import payOutModel from "../models/payOutGenerate.model.js";
import userDB from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const allPayOutPayment = asyncHandler(async (req, res) => {
    let GetData = await payOutModel.aggregate([{ $lookup: { from: "users", localField: "memberId", foreignField: "_id", as: "userInfo" } },
    {
        $unwind: {
            path: "$userInfo",
            preserveNullAndEmptyArrays: true,
        }
    }, {
        $project: { "_id": 1, "trxId": 1, "accountHolderName": 1, "optxId": 1, "accountNumber": 1, "ifscCode": 1, "amount": 1, "bankRRN": 1, "isSuccess": 1, "createdAt": 1, "userInfo.userName": 1, "userInfo.fullName": 1, "userInfo.memberId": 1 }
    }]);
    res.status(200).json({ message: "Success", data: GetData })
});

export const generatePayOut = asyncHandler(async (req, res) => {
    const { memberId, trxPassword, mobileNumber, accountHolderName, accountNumber, ifscCode, trxId, amount } = req.body;
    let user = await userDB.findOne({ memberId: memberId });
    if (!user) {
        return res.status(400).json({ message: "Failed", data: "Invalid Credentials User Not Found !" })
    }

    if (user.memberId !== memberId || user.trxPassword !== trxPassword) {
        return res.status(401).json({ message: "Failed", date: "Invalid Credentials !" })
    }

    let userStoreData = {
        memberId: user._id,
        mobileNumber: mobileNumber,
        accountHolderName: accountHolderName,
        accountNumber: accountNumber,
        ifscCode: ifscCode,
        amount: amount,
        trxId: trxId
    }
    let data = await payOutModel.create(userStoreData);

    // Payout data store successfully and send to the banking side


    //  banking side api call end 

    let userResponse = {
        status_code: 200,
        status_msg: "Success",
        status: "Success",
        txnid: "43543",
        optxid: "4543"
    }

    res.status(200).json({ message: "Success", data: userResponse })
});

export const payoutStatusCheck = asyncHandler(async (req, res) => {
    let trxIdGet = req.params.trxId;
    let pack = await payOutModel.aggregate([{ $match: { trxId: trxIdGet } }, { $lookup: { from: "users", localField: "memberId", foreignField: "_id", as: "userInfo" } },
    {
        $unwind: {
            path: "$userInfo",
            preserveNullAndEmptyArrays: true,
        }
    }, {
        $project: { "_id": 1, "trxId": 1, "accountHolderName": 1, "optxId": 1, "accountNumber": 1, "ifscCode": 1, "amount": 1, "bankRRN": 1, "isSuccess": 1, "createdAt": 1, "userInfo.userName": 1, "userInfo.fullName": 1, "userInfo.memberId": 1 }
    }]);
    if (!pack.length) {
        return res.status(400).json({ message: "Faild", data: "No Transaction !" })
    }
    res.status(200).json({
        message: "Success",
        data: pack
    })
});

export const payoutStatusUpdate = asyncHandler(async (req, res) => {
    let trxIdGet = req.params.trxId;
    let pack = await payOutModel.findOne({ trxId: trxIdGet })
    if (!pack) {
        return res.status(400).json({ message: "Failed", data: "No Transaction !" })
    }
    if (pack.isSuccess === "Success" || pack.isSuccess === "Failed") {
        return res.status(400).json({ message: "Failed", data: `Transaction Status Can't Update Already: ${pack?.isSuccess}` })
    }
    pack.isSuccess = req.body.isSuccess;
    await pack.save()
    res.status(200).json({ message: "Success", data: pack })
});

export const payoutCallBackResponse = asyncHandler(async (req, res) => {


    let userResponse = {
        status_code: 200,
        status_msg: "Ok",
        status: "SUCCESS",
        amount: 500,
        txnid: 100,
        rrn: "4545",
        opt_msg: "Transaction Fetch Successfully"
    }
    res.status(200).json({ message: "Success", data: userResponse });
});