import axios from "axios";
import qrGenerationModel from "../models/qrGeneration.model.js";
import payInModel from "../models/payIn.model.js";
import userDB from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const allGeneratedPayment = asyncHandler(async (req, res) => {
    let payment = await qrGenerationModel.aggregate([{ $lookup: { from: "users", localField: "memberId", foreignField: "_id", as: "userInfo" } },
    {
        $unwind: {
            path: "$userInfo",
            preserveNullAndEmptyArrays: true,
        }
    }, {
        $project: { "_id": 1, "trxId": 1, "amount": 1, "name": 1, "callBackStatus": 1, "qrData": 1, "createdAt": 1, "userInfo.userName": 1, "userInfo.fullName": 1, "userInfo.memberId": 1 }
    }
    ]).then((result) => {
        res.status(200).json({ message: "Success", result })
    })
});

export const generatePayment = asyncHandler(async (req, res) => {
    const { memberId, trxPassword, name, amount, trxId } = req.body

    let user = await userDB.aggregate([{ $match: { $and: [{ memberId: memberId }, { trxPassword: trxPassword }] } }, { $lookup: { from: "payinswitches", localField: "payInApi", foreignField: "_id", as: "payInApi" } }, { $project: { "_id": 1, "memberId": 1, "trxPassword": 1, "payInApi._id": 1, "payInApi.apiName": 1, "payInApi.apiURL": 1, "payInApi.isActive": 1 } }, {
        $unwind: {
            path: "$payInApi",
            preserveNullAndEmptyArrays: true,
        }
    }])

    if (user.length === 0) {
        return res.status(400).json({ message: "Failed", data: "Invalid User Please change again !" })
    }

    // Api Switch Database and added 
    let ApiSwitch = `${user[0].payInApi.apiURL}`
    let stringReplace = [
        { placeholderName: "${memberId}", value: memberId },
        { placeholderName: "${trxPassword}", value: trxPassword },
        { placeholderName: "${name}", value: name },
        { placeholderName: "${amount}", value: amount },
        { placeholderName: "${trxId}", value: trxId }
    ]

    for (const str of stringReplace) {
        ApiSwitch = ApiSwitch.replaceAll(str.placeholderName, str.value)
    }
    // Api Switch Database and added  end

    // store database
    await qrGenerationModel.create({ memberId: "66b4942200797c8f64fd8f9c", name, amount, trxId }).then(async (data) => {
        // Banking Api
        let API_URL = ApiSwitch
        let bank = await axios.get(API_URL);

        data.qrData = bank.data.intent;
        data.refId = bank.data.refId;
        await data.save();

        // Send response
        res.status(200).json({
            message: "Sucess",
            data: {
                status_msg: bank.data.status_msg,
                status: bank.data.status_code,
                qr: bank.data.intent,
                trxID: data.trxId,
            },
        })
    }).catch((error) => {
        res.status(400).json({ message: "Failed", data: error.message })
        })
});

export const paymentStatusCheck = asyncHandler(async (req, res) => {
    let trxIdGet = req.params.trxId;
    let pack = await qrGenerationModel.aggregate([{ $match: { trxId: trxIdGet } }, { $lookup: { from: "users", localField: "memberId", foreignField: "_id", as: "userInfo" } },
    {
        $unwind: {
            path: "$userInfo",
            preserveNullAndEmptyArrays: true,
        }
    }, {
        $project: { "_id": 1, "trxId": 1, "amount": 1, "name": 1, "callBackStatus": 1, "qrData": 1, "createdAt": 1, "userInfo.userName": 1, "userInfo.fullName": 1, "userInfo.memberId": 1 }
    }]);
    if (!pack.length) {
        res.status(400).json({ message: "Faild", data: "No Transaction !" })
    }
    res.status(200).json({
        message: "Success",
        data: pack
    })
});

export const paymentStatusUpdate = asyncHandler(async (req, res) => {
    let trxIdGet = req.params.trxId;
    let pack = await qrGenerationModel.findOne({ trxId: trxIdGet }).then(async (data) => {
        if (!data) {
            res.status(400).json({ message: "Failed", data: "No Transaction !" })
        }
        if (data.callBackStatus === "Success" || data.callBackStatus === "Failed") {
            res.status(400).json({ message: "Failed", data: `Transaction Status Can't Update : ${data.callBackResponse}` })
        }
        data.callBackStatus = "hello";
        // await data.save()
        console.log(data)
        res.status(200).json({ message: "Success", data: data })
    })
})

export const callBackResponse = asyncHandler(async (req, res) => {
    // let data = req.body.data;
    let data = { status: "200", payerAmount: "200", payerName: "Test", txnID: "12345667875799", BankRRN: "123564654564", payerVA: "0000000000@ybl", TxnInitDate: "20220608131419", TxnCompletionDate: "20220608131422" }
    let pack = await qrGenerationModel.findOne({ trxId: data.txnID });
    if (pack) {
        pack.callBackStatus = true
        pack.save();

        let gatwarCharge = (1.5 / 100) * data.payerAmount
        let finalCredit = data.payerAmount - gatwarCharge

        let payinDataStore = { memberId: pack.memberId, payerName: data.payerName, trxId: data.txnID, amount: data.payerAmount, chargeAmount: gatwarCharge, finalAmount: finalCredit, vpaId: data.payerVA, bankRRN: data.BankRRN, description: `Qr Generated Successfully Amount:${data.payerAmount} PayerVa:${data.payerVA} BankRRN:${data.BankRRN}`, isSuccess: (200) ? true : false }

        let payInSuccessStore = await payInModel.create(payinDataStore);
        // callback send to the user url

        // callback end to the user url

        res.status(200).json({
            message: "Success",
            data: data
        })
    }
    res.status(400).json({ succes: "Faild", message: "Txn Id Not Avabile !" })
})