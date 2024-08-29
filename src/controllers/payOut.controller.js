import axios from "axios";
import payOutModelGenerate from "../models/payOutGenerate.model.js";
import payOutModel from "../models/payOutSuccess.model.js";
import walletModel from "../models/wallet.model.js";
import callBackResponse from "../models/callBackResponse.model.js";
import userDB from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const allPayOutPayment = asyncHandler(async (req, res) => {
    let GetData = await payOutModelGenerate.aggregate([{ $lookup: { from: "users", localField: "memberId", foreignField: "_id", as: "userInfo" } },
    {
        $unwind: {
            path: "$userInfo",
            preserveNullAndEmptyArrays: true,
        }
    }, {
        $project: { "_id": 1, "trxId": 1, "accountHolderName": 1, "optxId": 1, "accountNumber": 1, "ifscCode": 1, "amount": 1, "bankRRN": 1, "isSuccess": 1, "chargeAmount": 1, "finalAmount": 1, "createdAt": 1, "userInfo.userName": 1, "userInfo.fullName": 1, "userInfo.memberId": 1 }
    }]);
    res.status(200).json(new ApiResponse(200, GetData))
});

export const generatePayOut = asyncHandler(async (req, res) => {
    const { memberId, trxPassword, mobileNumber, accountHolderName, accountNumber, ifscCode, trxId, amount } = req.body;

    let user = await userDB.aggregate([{ $match: { memberId: memberId } }, { $lookup: { from: "payoutswitches", localField: "payOutApi", foreignField: "_id", as: "payOutApi" } }, {
        $unwind: {
            path: "$payOutApi",
            preserveNullAndEmptyArrays: true,
        }
    }, {
        $project: { "_id": 1, "userName": 1, "memberId": 1, "fullName": 1, "trxPassword": 1, "minWalletBalance": 1, "EwalletBalance": 1, "createdAt": 1, "payOutApi._id": 1, "payOutApi.apiName": 1, "payOutApi.apiURL": 1, "payOutApi.isActive": 1 }
    }])

    if (user[0]?.memberId !== memberId && user[0]?.trxPassword !== trxPassword) {
        return res.status(401).json({ message: "Failed", date: "Invalid Credentials !" })
    }

    let userUseAbelBalance = user[0]?.EwalletBalance - user[0]?.minWalletBalance

    if (amount > user[0]?.EwalletBalance) {
        return res.status(400).json({ message: "Failed", date: `Insufficient Fund usable Amount: ${userUseAbelBalance}` })
    }

    // if the data is lese then the amount the data
    if (amount > userUseAbelBalance) {
        return res.status(400).json({ message: "Failed", data: `Insufficient Balance Holding Amount :${user[0]?.minWalletBalance} Usable Amount : ${userUseAbelBalance}` })
    }

    let userStoreData = {
        memberId: user[0]._id,
        mobileNumber: mobileNumber,
        accountHolderName: accountHolderName,
        accountNumber: accountNumber,
        ifscCode: ifscCode,
        amount: amount,
        trxId: trxId
    }
    let data = await payOutModelGenerate.create(userStoreData);

    // Payout data store successfully and send to the banking side


    //  banking side api call end 

    let userResponse = {
        status_code: 200,
        status_msg: "Success",
        status: "Success",
        txnid: "43543",
        optxid: "4543"
    }

    res.status(200).json(new ApiResponse(200, userResponse))
});

export const payoutStatusCheck = asyncHandler(async (req, res) => {
    let trxIdGet = req.params.trxId;
    let pack = await payOutModelGenerate.aggregate([{ $match: { trxId: trxIdGet } }, { $lookup: { from: "users", localField: "memberId", foreignField: "_id", as: "userInfo" } },
    {
        $unwind: {
            path: "$userInfo",
            preserveNullAndEmptyArrays: true,
        }
    }, {
        $project: { "_id": 1, "trxId": 1, "accountHolderName": 1, "optxId": 1, "accountNumber": 1, "ifscCode": 1, "amount": 1, "bankRRN": 1, "chargeAmount": 1, "finalAmount": 1, "isSuccess": 1, "createdAt": 1, "userInfo.userName": 1, "userInfo.fullName": 1, "userInfo.memberId": 1 }
    }]);
    if (!pack.length) {
        return res.status(400).json({ message: "Faild", data: "No Transaction !" })
    }
    res.status(200).json(new ApiResponse(200, pack))
});

export const payoutStatusUpdate = asyncHandler(async (req, res) => {
    let trxIdGet = req.params.trxId;
    let pack = await payOutModelGenerate.findOne({ trxId: trxIdGet })
    if (!pack) {
        return res.status(400).json({ message: "Failed", data: "No Transaction !" })
    }
    if (pack.isSuccess === "Success" || pack.isSuccess === "Failed") {
        return res.status(400).json({ message: "Failed", data: `Transaction Status Can't Update Already: ${pack?.isSuccess}` })
    }
    pack.isSuccess = req.body.isSuccess;
    await pack.save()
    res.status(200).json(new ApiResponse(200, pack))
});

export const payoutCallBackResponse = asyncHandler(async (req, res) => {
    let data = { txnid: "55dndlh764yf", optxid: "43543948", amount: 100, rrn: "43543543534", status: "Success", statusCode: 200, statusMessage: "message on status" }

    let userResponse = {
        status_code: 200,
        status_msg: "Ok",
        status: "SUCCESS",
        amount: 500,
        txnid: 100,
        rrn: "4545",
        opt_msg: "Transaction Fetch Successfully"
    }

    if (data.statusCode != 200) {
        return res.status(400).json({ succes: "Failed", message: "Payment Failed Operator Side !" })
    }

    // get the trxid Data 
    let getDocoment = await payOutModelGenerate.findOne({ trxId: data.txnid });

    if (getDocoment && data?.rrn) {
        getDocoment.isSuccess = "Success"
        await getDocoment.save();

        let userInfo = await userDB.aggregate([{ $match: { _id: getDocoment?.memberId } }, { $lookup: { from: "packages", localField: "package", foreignField: "_id", as: "package" } }, {
            $unwind: {
                path: "$package",
                preserveNullAndEmptyArrays: true,
            }
        }, { $lookup: { from: "payoutswitches", localField: "payOutApi", foreignField: "_id", as: "payOutApi" } }, {
            $unwind: {
                path: "$payOutApi",
                preserveNullAndEmptyArrays: true,
            }
        }, {
            $project: { "_id": 1, "userName": 1, "memberId": 1, "fullName": 1, "trxPassword": 1, "EwalletBalance": 1, "createdAt": 1, "package._id": 1, "package.packageName": 1, "package.packagePayOutCharge": 1, "package.isActive": 1, "payOutApi._id": 1, "payOutApi.apiName": 1, "payOutApi.apiURL": 1, "payOutApi.isActive": 1 }
        }]);

        let chargePaymentGatway = (userInfo[0]?.package.packagePayOutCharge / 100) * data.amount;
        let finalAmount = data.amount - chargePaymentGatway;

        let userWalletInfo = await userDB.findById(userInfo[0]?._id, "_id EwalletBalance");
        let beforeAmountUser = userWalletInfo.EwalletBalance;

        let walletModelDataStore = {
            memberId: userWalletInfo._id,
            transactionType: "Dr.",
            transactionAmount: data?.amount,
            beforeAmount: beforeAmountUser,
            afterAmount: beforeAmountUser - data.amount,
            description: `Successfully Dr. amount: ${data?.amount}`,
            transactionStatus: "Success",
        }

        // update the user wallet balance 
        userWalletInfo.EwalletBalance -= data?.amount
        await userWalletInfo.save();

        let storeTrx = await walletModel.create(walletModelDataStore)

        let payoutDataStore = {
            memberId: getDocoment?.memberId,
            amount: data?.amount,
            chargeAmount: chargePaymentGatway,
            finalAmount: finalAmount,
            bankRRN: data?.rrn,
            trxId: data?.txnid,
            optxId: data?.optxid,
            isSuccess: "Success"
        }

        await payOutModel.create(payoutDataStore)

        // callback response to the 
        let userCallBackResp = await callBackResponse.aggregate([{ $match: { memberId: userInfo[0]?._id } }]);

        if (userCallBackResp.length !== 1) {
            return res.status(400).json({ message: "Failed", data: "User have multiple callback Url or Not Found !" })
        }

        let payOutUserCallBackURL = userCallBackResp[0]?.payOutCallBackUrl;
        // Calling the user callback and send the response to the user 
        console.log(payOutUserCallBackURL, "user store callback url")

        let apiResponseData = { userResponse, userWalletInfo, storeTrx }

        // end the user callback calling and send response 
        return res.status(200).json(new ApiResponse(200, apiResponseData))
    }

    res.status(400).json({ message: "Failed", data: "Trx Id and user not Found !" })
});