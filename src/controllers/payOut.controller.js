import axios from "axios";
import payOutModelGenerate from "../models/payOutGenerate.model.js";
import payOutModel from "../models/payOutSuccess.model.js";
import userDB from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

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
    res.status(200).json({ message: "Success", data: GetData })
});

export const generatePayOut = asyncHandler(async (req, res) => {
    const { memberId, trxPassword, mobileNumber, accountHolderName, accountNumber, ifscCode, trxId, amount } = req.body;

    let user = await userDB.aggregate([{ $match: { memberId: memberId } }, { $lookup: { from: "packages", localField: "package", foreignField: "_id", as: "package" } }, {
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
        $project: { "_id": 1, "userName": 1, "memberId": 1, "fullName": 1, "trxPassword": 1, "createdAt": 1, "package._id": 1, "package.packageName": 1, "package.packagePayOutCharge": 1, "package.isActive": 1, "payOutApi._id": 1, "payOutApi.apiName": 1, "payOutApi.apiURL": 1, "payOutApi.isActive": 1 }
    }])

    if (user[0]?.memberId !== memberId && user[0]?.trxPassword !== trxPassword) {
        return res.status(401).json({ message: "Failed", date: "Invalid Credentials !" })
    }

    let chargeGatway = (user[0]?.package?.packagePayOutCharge / 100) * amount
    let finalAmountAdd = amount - chargeGatway

    let userStoreData = {
        memberId: user[0]._id,
        mobileNumber: mobileNumber,
        accountHolderName: accountHolderName,
        accountNumber: accountNumber,
        ifscCode: ifscCode,
        amount: amount,
        chargeAmount: chargeGatway,
        finalAmount: finalAmountAdd,
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

    res.status(200).json({ message: "Success", data: userResponse })
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
    res.status(200).json({
        message: "Success",
        data: pack
    })
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
    res.status(200).json({ message: "Success", data: pack })
});

export const payoutCallBackResponse = asyncHandler(async (req, res) => {
    let data = { txnid: "jkdlfhjdckyjf43", optxid: "43543948", amount: 5000, rrn: "43543543534", status: "Success", statusCode: 200, statusMessage: "message on status" }

    let userResponse = {
        status_code: 200,
        status_msg: "Ok",
        status: "SUCCESS",
        amount: 500,
        txnid: 100,
        rrn: "4545",
        opt_msg: "Transaction Fetch Successfully"
    }

    if (data.statusCode !== 200) {
       return res.status(200).json({ userResponse });
    }
    // get the trxid Data 
    let getDocoment = await payOutModelGenerate.findOne({ trxId: data.txnid });

    if (!getDocoment) {
        return res.status(400).json({ message: "Failed", data: "transaction not found !" })
    }

    

    res.status(200).json({ message: "Success",data:getDocoment })


});