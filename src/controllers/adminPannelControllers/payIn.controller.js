import axios from "axios";
import qrGenerationModel from "../../models/qrGeneration.model.js";
import payInModel from "../../models/payIn.model.js";
import upiWalletModel from "../../models/upiWallet.model.js";
import userDB from "../../models/user.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import callBackResponseModel from "../../models/callBackResponse.model.js";
import FormData from "form-data";
import { Mutex } from "async-mutex";
import { getPaginationArray } from "../../utils/helpers.js";
import mongoose from "mongoose";
import razorpay from "../../utils/RazorPay.js";
import { validatePaymentVerification } from "razorpay/dist/utils/razorpay-utils.js";

const transactionMutex = new Mutex();
const razorPayMutex = new Mutex();

export const allGeneratedPayment = asyncHandler(async (req, res) => {
    let { page = 1, limit = 25, keyword = "", startDate, endDate, memberId } = req.query;
    page = Number(page) || 1;
    limit = Number(limit) || 25;

    const trimmedKeyword = keyword.trim();
    const trimmedMemberId = memberId && mongoose.Types.ObjectId.isValid(memberId)
        ? new mongoose.Types.ObjectId(String(memberId.trim()))
        : null;
    const skip = (page - 1) * limit;

    let dateFilter = {};
    if (startDate) {
        dateFilter.$gte = new Date(startDate);
    }
    if (endDate) {
        endDate = new Date(endDate);
        endDate.setHours(23, 59, 59, 999); // Modify endDate in place
        dateFilter.$lt = new Date(endDate); // Wrap in new Date() to maintain proper format
    }

    let matchFilters = {
        ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
        ...(trimmedKeyword && {
            $or: [
                { trxId: { $regex: trimmedKeyword, $options: "i" } },
                { payerName: { $regex: trimmedKeyword, $options: "i" } },
            ]
        }),
        ...(trimmedMemberId && { memberId: trimmedMemberId })
    };

    try {
        const sortDirection = Object.keys(dateFilter).length > 0 ? 1 : -1;
        const aggregationPipeline = [
            {
                $match: matchFilters
            },
            { $sort: { createdAt: sortDirection } },

            { $skip: skip },
            { $limit: limit },

            {
                $lookup: {
                    from: "users",
                    localField: "memberId",
                    foreignField: "_id",
                    pipeline: [
                        { $project: { userName: 1, fullName: 1, memberId: 1 } }
                    ],
                    as: "userInfo"
                }
            },

            {
                $unwind: {
                    path: "$userInfo",
                    preserveNullAndEmptyArrays: false
                }
            },

            {
                $project: {
                    "_id": 1,
                    "trxId": 1,
                    "amount": 1,
                    "name": 1,
                    "callBackStatus": 1,
                    "qrData": 1,
                    "refId": 1,
                    "createdAt": 1,
                    "userInfo.userName": 1,
                    "userInfo.fullName": 1,
                    "userInfo.memberId": 1
                }
            }
        ];

        let payments = await qrGenerationModel.aggregate(aggregationPipeline).allowDiskUse(true);

        const totalDocs = await qrGenerationModel.countDocuments(matchFilters);

        if (!payments || payments.length === 0) {
            return res.status(200).json({ message: "Success", data: "No Transaction Available!" });
        }

        res.status(200).json(new ApiResponse(200, payments, totalDocs));
    } catch (err) {
        res.status(500).json({
            message: "Failed",
            data: `Internal Server Error: ${err.message}`,
        });
    }
});

export const allSuccessPayment = asyncHandler(async (req, res) => {
    let { page = 1, limit = 25, keyword = "", startDate, endDate, memberId } = req.query;
    page = Number(page) || 1;
    limit = Number(limit) || 25;
    const trimmedKeyword = keyword.trim();
    const skip = (page - 1) * limit;

    const trimmedMemberId = memberId && mongoose.Types.ObjectId.isValid(memberId)
        ? new mongoose.Types.ObjectId(String(memberId.trim()))
        : null;

    let dateFilter = {};
    if (startDate) {
        dateFilter.$gte = new Date(startDate);
    }
    if (endDate) {
        endDate = new Date(endDate);
        endDate.setHours(23, 59, 59, 999); // Modify endDate in place
        dateFilter.$lt = new Date(endDate); // Wrap in new Date() to maintain proper format
    }

    let matchFilters = {
        ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
        ...(trimmedKeyword && {
            $or: [
                { trxId: { $regex: trimmedKeyword, $options: "i" } },
                { payerName: { $regex: trimmedKeyword, $options: "i" } },
                { bankRRN: { $regex: trimmedKeyword, $options: "i" } },
            ]
        }),
        ...(trimmedMemberId && { memberId: trimmedMemberId })
    };
    const sortDirection = Object.keys(dateFilter).length > 0 ? 1 : -1;

    let paymentQuery = [
        { $match: matchFilters },

        { $sort: { createdAt: sortDirection } },

        { $skip: skip },
        { $limit: limit },

        {
            $lookup: {
                from: "users",
                localField: "memberId",
                foreignField: "_id",
                pipeline: [
                    { $project: { userName: 1, fullName: 1, memberId: 1 } }
                ],
                as: "userInfo"
            }
        },


        {
            $unwind: {
                path: "$userInfo",
                preserveNullAndEmptyArrays: false
            }
        },


        {
            $project: {
                "_id": 1,
                "trxId": 1,
                "amount": 1,
                "chargeAmount": 1,
                "finalAmount": 1,
                "payerName": 1,
                "isSuccess": 1,
                "vpaId": 1,
                "bankRRN": 1,
                "createdAt": 1,
                "userInfo.userName": 1,
                "userInfo.fullName": 1,
                "userInfo.memberId": 1
            }
        }
    ];

    try {

        let payments = await payInModel.aggregate(paymentQuery).allowDiskUse(true);

        if (!payments || payments.length === 0) {
            return res.status(200).json({ message: "Success", data: "No Transaction Available!" });
        }


        const totalDocs = await payInModel.countDocuments(matchFilters);

        res.status(200).json(new ApiResponse(200, payments, totalDocs));
    } catch (err) {
        res.status(500).json({ message: "Failed", data: `Internal Server Error: ${err.message}` });
    }
});

export const generatePayment = asyncHandler(async (req, res) => {
    const { userName, authToken, name, amount, trxId, mobileNumber } = req.body
    const tempTransaction = await qrGenerationModel.findOne({trxId})
    if(tempTransaction) return res.status(400).json({ message: "Failed", data: "Transaction Id alrteady exists !" })
    let user = await userDB.aggregate([{ $match: { $and: [{ userName: userName }, { trxAuthToken: authToken }, { isActive: true }] } }, { $lookup: { from: "payinswitches", localField: "payInApi", foreignField: "_id", as: "payInApi" } }, {
        $unwind: {
            path: "$payInApi",
            preserveNullAndEmptyArrays: true,
        }
    }])

    if (user.length === 0) {
        return res.status(400).json({ message: "Failed", data: "Invalid User or InActive user Please Try again !" })
    }
 
    let apiSwitchApiOption = user[0]?.payInApi?.apiName;
    switch (apiSwitchApiOption) {
        case "neyopayPayIn":
            let url = user[0].payInApi.apiURL
            let formData = new FormData()
            formData.append("amount", amount)
            formData.append("Apikey", "14205")
            formData.append("url", "https://zanithpay.com")
            formData.append("transactionId", trxId)
            formData.append("mobile", mobileNumber)

            // store database
            await qrGenerationModel.create({ memberId: user[0]?._id, name, amount, trxId }).then(async (data) => {
                // Bankking api calling !
                let resp = await axios.post(url, formData)

                let dataApiResponse = {
                    status_msg: resp?.data?.message,
                    status: resp?.data?.status == true ? 200 : 400,
                    qrImage: resp?.data?.Payment_link,
                    trxID: trxId,
                }

                if (resp?.data?.status !== true) {
                    data.callBackStatus = "Failed";
                    await data.save();
                    return res.status(400).json({ message: "Failed", data: dataApiResponse })
                } else {
                    data.qrData = resp?.data?.Payment_link;
                    data.refId = resp?.data?.refId;
                    await data.save();
                }

                // Send response
                return res.status(200).json(new ApiResponse(200, dataApiResponse))
            }).catch((error) => {
                if (error.code == 11000) {
                    return res.status(500).json({ message: "Failed", data: "trx Id duplicate Find !" })
                } else {
                    return res.status(500).json({ message: "Failed", data: "Internel Server Error !" })
                }
            })
            break;
        case "impactpeaksoftwareApi":
            // store database
            await qrGenerationModel.create({ memberId: user[0]?._id, name, amount, trxId }).then(async (data) => {
                // Banking Api
                let API_URL = `https://impactpeaksoftware.in/portal/api/generateQrAuth?memberid=IMPSAPI837165&txnpwd=8156&name=${name}&mobile=${mobileNumber}&amount=${amount}&txnid=${trxId}`
                let bank = await axios.get(API_URL);

                let dataApiResponse = {
                    status_msg: bank?.data?.status_msg,
                    status: bank?.data?.status_code,
                    qrImage: bank?.data?.qr_image,
                    qr: bank?.data?.intent,
                    trxID: data?.trxId,
                }

                if (bank?.data?.status_code !== 200) {
                    data.callBackStatus = "Failed";
                    await data.save();
                    return res.status(400).json({ message: "Failed", data: dataApiResponse })
                } else {
                    data.qrData = bank?.data?.qr_image;
                    data.qrIntent = bank?.data?.intent;
                    data.refId = bank?.data?.refId;
                    await data.save();
                }

                // Send response
                return res.status(200).json(new ApiResponse(200, dataApiResponse))
            }).catch((error) => {
                if (error.code == 11000) {
                    return res.status(500).json({ message: "Failed", data: "trx Id duplicate Find !" })
                } else {
                    return res.status(500).json({ message: "Failed", data: "Internel Server Error !" })
                }
            })
            break;
        case "razorpayPayIn":


            try {
                const tempPayment = await qrGenerationModel.findOne({ trxId })
                if (tempPayment) return res.status(400).json({ message: "Failed", data: "Transaction Id already exists." })
                const paymentData = await qrGenerationModel.create({
                    memberId: user[0]?._id,
                    name,
                    amount,
                    trxId,
                });

                const rzOptions = {
                    "amount": amount * 100,
                    "currency": "INR",
                    "accept_partial": false,
                    "first_min_partial_amount": 100,
                    "expire_by": 1733838891267,
                    "reference_id": trxId,
                    "description": "Payment for policy no #23456",
                    "customer": {
                        "name": name,
                        "contact": mobileNumber,
                    },
                    "notify": {
                        "sms": true,
                        "email": true
                    },
                    "reminder_enable": true,
                    "notes": {
                        "policy_name": "Jeevan Bima"
                    },
                    "callback_url": ``,
                    // "redirect": false, 
                    // "callback_url": `${process.env.BASE_URL}apiAdmin/v1/payin/callBack`,
                    "callback_method": "get"
                }
                console.log("options>>>>", rzOptions);
                const paymentLink = await razorpay.paymentLink.create(rzOptions);

                paymentData.qrData = paymentLink.short_url;
                paymentData.refId = paymentLink.id;
                await paymentData.save();

                return res.status(200).json(new ApiResponse(200, {
                    status_msg: "Payment link generated successfully",
                    status: 200,
                    qrImage: paymentLink.short_url,
                    trxID: trxId,
                }));
            } catch (error) {
                console.error("Error creating Razorpay payment link:", error);

                if (error.code === 11000) {
                    return res.status(500).json({ message: "Failed", data: "trx Id duplicate found!" });
                } else {
                    return res.status(500).json({ message: "Failed", data: "Internal Server Error!" });
                }
            }
            break;
        case "ServerMaintenance":
            let serverResp = {
                status_msg: "Server Under Maintenance !",
                status: 400,
                trxID: trxId,
            }
            return res.status(400).json({ message: "Failed", data: serverResp })
        default:
            let dataApiResponse = {
                status_msg: "failed",
                status: 400,
                trxID: trxId,
            }
            return res.status(400).json({ message: "Failed", data: dataApiResponse })
    }
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
        return res.status(400).json({ message: "Faild", data: "No Transaction !" })
    }
    res.status(200).json(new ApiResponse(200, pack))
});

export const paymentStatusUpdate = asyncHandler(async (req, res) => {
    let trxIdGet = req.params.trxId;
    let pack = await qrGenerationModel.findOne({ trxId: trxIdGet }).then(async (data) => {
        if (!data) {
            return res.status(400).json({ message: "Failed", data: "No Transaction !" })
        }
        if (data.callBackStatus === "Success" || data.callBackStatus === "Failed") {
            return res.status(400).json({ message: "Failed", data: `Transaction Status Can't Update Already : ${data.callBackStatus}` })
        }
        data.callBackStatus = req.body.callBackStatus;
        await data.save()
        res.status(200).json(new ApiResponse(200, data))
    })
});

export const callBackResponse = asyncHandler(async (req, res) => {
    const release = await transactionMutex.acquire();
    try {
        let callBackData = req.body;
        if (Object.keys(req.body).length === 1) {
            let key = Object.keys(req.body)
            let stringfi = JSON.parse(key)
            req.body = stringfi;
            callBackData = stringfi;
        }

        var data;
        let switchApi;
        if (req.body.partnerTxnId) {
            switchApi = "neyopayPayIn"
        }
        if (req.body.txnID) {
            switchApi = "marwarpayInSwitch"
        }
        switch (switchApi) {
            case "neyopayPayIn":
                data = { status: callBackData?.txnstatus == "Success" || "success" ? "200" : "400", payerAmount: callBackData?.amount, payerName: callBackData?.payerName, txnID: callBackData?.partnerTxnId, BankRRN: callBackData?.rrn, payerVA: callBackData?.payerVA, TxnInitDate: callBackData?.TxnInitDate, TxnCompletionDate: callBackData?.TxnCompletionDate }
                break;
            case "marwarpayInSwitch":
                data = { status: callBackData?.status, payerAmount: callBackData?.payerAmount, payerName: callBackData?.payerName, txnID: callBackData?.txnID, BankRRN: callBackData?.BankRRN, payerVA: callBackData?.payerVA, TxnInitDate: callBackData?.TxnInitDate, TxnCompletionDate: callBackData?.TxnCompletionDate }
                break;
            default:
                console.log("its default")
                break;
        }

        if (data?.status != "200") {
            return res.status(400).json({ message: "Failed", data: "trx is pending or not success" })
        }

        let pack = await qrGenerationModel.findOne({ trxId: data?.txnID });

        if (pack?.callBackStatus !== "Pending") {
            return res.status(400).json({ message: "Failed", data: `Trx already done status or not created : ${pack?.callBackStatus}` })
        }

        if (pack && data?.BankRRN) {
            pack.callBackStatus = "Success"
            pack.save();

            let userInfo = await userDB.aggregate([{ $match: { _id: pack?.memberId } }, { $lookup: { from: "packages", localField: "package", foreignField: "_id", as: "package" } }, {
                $unwind: {
                    path: "$package",
                    preserveNullAndEmptyArrays: true,
                }
            }, { $lookup: { from: "payinpackages", localField: "package.packagePayInCharge", foreignField: "_id", as: "packageCharge" } }, {
                $unwind: {
                    path: "$packageCharge",
                    preserveNullAndEmptyArrays: true,
                }
            }, {
                $project: { "_id": 1, "userName": 1, "memberId": 1, "fullName": 1, "trxPassword": 1, "upiWalletBalance": 1, "createdAt": 1, "packageCharge._id": 1, "packageCharge.payInPackageName": 1, "packageCharge.payInChargeRange": 1, "packageCharge.isActive": 1 }
            }])

            let chargeRange = userInfo[0]?.packageCharge?.payInChargeRange;
            var chargeTypePayIn;
            var chargeAmoutPayIn;

            chargeRange.forEach((value) => {
                if (value.lowerLimit <= data?.payerAmount && value.upperLimit > data?.payerAmount) {
                    chargeTypePayIn = value.chargeType
                    chargeAmoutPayIn = value.charge
                    return 0;
                }
            })

            var userChargeApply;
            var finalAmountAdd;

            if (chargeTypePayIn === "Flat") {
                userChargeApply = chargeAmoutPayIn;
                finalAmountAdd = data?.payerAmount - userChargeApply;
            } else {
                userChargeApply = (chargeAmoutPayIn / 100) * data?.payerAmount;
                finalAmountAdd = data?.payerAmount - userChargeApply;
            }

            let gatwarCharge = userChargeApply;
            let finalCredit = finalAmountAdd;

            let payinDataStore = { memberId: pack?.memberId, payerName: data?.payerName, trxId: data?.txnID, amount: data?.payerAmount, chargeAmount: gatwarCharge, finalAmount: finalCredit, vpaId: data?.payerVA, bankRRN: data?.BankRRN, description: `Qr Generated Successfully Amount:${data?.payerAmount} PayerVa:${data?.payerVA} BankRRN:${data?.BankRRN}`, trxCompletionDate: data?.TxnCompletionDate, trxInItDate: data?.TxnInitDate, isSuccess: data?.status == 200 || "200" || "Success" || "success" ? "Success" : "Failed" }

            let upiWalletDataObject = { memberId: userInfo[0]?._id, transactionType: "Cr.", transactionAmount: finalCredit, beforeAmount: userInfo[0]?.upiWalletBalance, afterAmount: userInfo[0]?.upiWalletBalance + finalCredit, description: `Successfully Cr. amount: ${finalCredit} with transaction Id: ${data?.txnID}`, transactionStatus: "Success" }

            await upiWalletModel.create(upiWalletDataObject);

            await payInModel.create(payinDataStore);
            await userDB.findByIdAndUpdate(userInfo[0]?._id, { upiWalletBalance: userInfo[0]?.upiWalletBalance + finalCredit })

            // callback send to the user url
            let callBackPayinUrl = await callBackResponseModel.find({ memberId: userInfo[0]?._id, isActive: true }).select("_id payInCallBackUrl isActive");
            const userCallBackURL = callBackPayinUrl[0]?.payInCallBackUrl;
            const config = {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            };

            let userRespSendApi = {
                status: data?.status,
                payerAmount: data?.payerAmount,
                payerName: data?.payerName,
                txnID: data?.txnID,
                BankRRN: data?.BankRRN,
                payerVA: data?.payerVA,
                TxnInitDate: data?.TxnInitDate,
                TxnCompletionDate: data?.TxnCompletionDate
            }

            await axios.post(userCallBackURL, userRespSendApi, config)
            res.status(200).json(new ApiResponse(200, null, "Successfully"))
        } else {
            return res.status(400).json({ succes: "Failed", message: "Txn Id Not Avabile!" })
        }
    } catch (error) {
        return res.status(500).json({ succes: "Failed", message: "Internal server error!" })
    } finally {
        release()
    }

});

export const testCallBackResponse = asyncHandler(async (req, res) => {
    const release = await transactionMutex.acquire();
    try {
        let callBackData = req.body;
        if (Object.keys(req.body).length === 1) {
            let key = Object.keys(req.body)
            let stringfi = JSON.parse(key)
            req.body = stringfi;
            callBackData = stringfi;
        }

        var data;
        let switchApi;
        if (req.body.partnerTxnId) {
            switchApi = "neyopayPayIn"
        }
        if (req.body.txnID) {
            switchApi = "marwarpayInSwitch"
        }
        switch (switchApi) {
            case "neyopayPayIn":
                data = { status: callBackData?.txnstatus == "Success" || "success" ? "200" : "400", payerAmount: callBackData?.amount, payerName: callBackData?.payerName, txnID: callBackData?.partnerTxnId, BankRRN: callBackData?.rrn, payerVA: callBackData?.payerVA, TxnInitDate: callBackData?.TxnInitDate, TxnCompletionDate: callBackData?.TxnCompletionDate }
                break;
            case "marwarpayInSwitch":
                data = { status: callBackData?.status, payerAmount: callBackData?.payerAmount, payerName: callBackData?.payerName, txnID: callBackData?.txnID, BankRRN: callBackData?.BankRRN, payerVA: callBackData?.payerVA, TxnInitDate: callBackData?.TxnInitDate, TxnCompletionDate: callBackData?.TxnCompletionDate }
                break;
            default:
                console.log("its default")
                break;
        }

        if (data?.status != "200") {
            return res.status(400).json({ message: "Failed", data: "trx is pending or not success" })
        }

        let pack = await qrGenerationModel.findOne({ trxId: data?.txnID });

        if (pack?.callBackStatus !== "Pending") {
            return res.status(400).json({ message: "Failed", data: `Trx already done status or not created : ${pack?.callBackStatus}` })
        }

        if (pack && data?.BankRRN) {
            pack.callBackStatus = "Success"
            await pack.save();

            let userInfo = await userDB.aggregate([{ $match: { _id: pack?.memberId } }, { $lookup: { from: "packages", localField: "package", foreignField: "_id", as: "package" } }, {
                $unwind: {
                    path: "$package",
                    preserveNullAndEmptyArrays: true,
                }
            }, { $lookup: { from: "payinpackages", localField: "package.packagePayInCharge", foreignField: "_id", as: "packageCharge" } }, {
                $unwind: {
                    path: "$packageCharge",
                    preserveNullAndEmptyArrays: true,
                }
            }, {
                $project: { "_id": 1, "userName": 1, "memberId": 1, "fullName": 1, "trxPassword": 1, "upiWalletBalance": 1, "createdAt": 1, "packageCharge._id": 1, "packageCharge.payInPackageName": 1, "packageCharge.payInChargeRange": 1, "packageCharge.isActive": 1 }
            }])

            let chargeRange = userInfo[0]?.packageCharge?.payInChargeRange;
            var chargeTypePayIn;
            var chargeAmoutPayIn;

            chargeRange.forEach((value) => {
                if (value.lowerLimit <= data?.payerAmount && value.upperLimit > data?.payerAmount) {
                    chargeTypePayIn = value.chargeType
                    chargeAmoutPayIn = value.charge
                    return 0;
                }
            })

            var userChargeApply;
            var finalAmountAdd;

            if (chargeTypePayIn === "Flat") {
                userChargeApply = chargeAmoutPayIn;
                finalAmountAdd = data?.payerAmount - userChargeApply;
            } else {
                userChargeApply = (chargeAmoutPayIn / 100) * data?.payerAmount;
                finalAmountAdd = data?.payerAmount - userChargeApply;
            }

            let gatwarCharge = userChargeApply;
            let finalCredit = finalAmountAdd;

            let payinDataStore = { memberId: pack?.memberId, payerName: data?.payerName, trxId: data?.txnID, amount: data?.payerAmount, chargeAmount: gatwarCharge, finalAmount: finalCredit, vpaId: data?.payerVA, bankRRN: data?.BankRRN, description: `Qr Generated Successfully Amount:${data?.payerAmount} PayerVa:${data?.payerVA} BankRRN:${data?.BankRRN}`, trxCompletionDate: data?.TxnCompletionDate, trxInItDate: data?.TxnInitDate, isSuccess: data?.status == 200 || "200" || "Success" || "success" ? "Success" : "Failed" }

            let upiWalletDataObject = { memberId: userInfo[0]?._id, transactionType: "Cr.", transactionAmount: finalCredit, beforeAmount: userInfo[0]?.upiWalletBalance, afterAmount: userInfo[0]?.upiWalletBalance + finalCredit, description: `Successfully Cr. amount: ${finalCredit}`, transactionStatus: "Success" }

            await upiWalletModel.create(upiWalletDataObject);

            await payInModel.create(payinDataStore);
            await userDB.findByIdAndUpdate(userInfo[0]?._id, { upiWalletBalance: userInfo[0]?.upiWalletBalance + finalCredit })

            // callback send to the user url
            let callBackPayinUrl = await callBackResponseModel.find({ memberId: userInfo[0]?._id, isActive: true }).select("_id payInCallBackUrl isActive");
            const userCallBackURL = callBackPayinUrl[0]?.payInCallBackUrl;
            const config = {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            };

            let userRespSendApi = {
                status: data?.status,
                payerAmount: data?.payerAmount,
                payerName: data?.payerName,
                txnID: data?.txnID,
                BankRRN: data?.BankRRN,
                payerVA: data?.payerVA,
                TxnInitDate: data?.TxnInitDate,
                TxnCompletionDate: data?.TxnCompletionDate
            }

            await axios.post(userCallBackURL, userRespSendApi, config)
            res.status(200).json(new ApiResponse(200, null, "Successfully"))
            // callback end to the user url
        } else {
            return res.status(400).json({ succes: "Failed", message: "Txn Id Not Avabile!" })
        }

    } catch (error) {
        console.log("error==>", error.message);
    } finally {
        release()
    }

});

export const rezorPayCallback = asyncHandler(async (req, res) => {
    const release = await razorPayMutex.acquire()
    try {
        if (req.body.event === "payment_link.paid") {
            const { payment_link: reqPaymentLinkObj, payment: reqPaymentObj } = req.body.payload;
            const qrGenDoc = await qrGenerationModel.findOne({ refId: reqPaymentLinkObj.entity.id });

            if (!qrGenDoc || reqPaymentLinkObj.entity.status !== "paid") return res.status(400).json({ succes: "Failed", message: "Txn Id Not Avabile!" });;

            qrGenDoc.isSuccess = "Success";

            const [userInfo] = await userDB.aggregate([
                { $match: { _id: qrGenDoc?.memberId } },
                { $lookup: { from: "packages", localField: "package", foreignField: "_id", as: "package" } },
                { $unwind: { path: "$package", preserveNullAndEmptyArrays: true } },
                { $lookup: { from: "payinpackages", localField: "package.packagePayInCharge", foreignField: "_id", as: "packageCharge" } },
                { $unwind: { path: "$packageCharge", preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        _id: 1,
                        userName: 1,
                        memberId: 1,
                        fullName: 1,
                        trxPassword: 1,
                        upiWalletBalance: 1,
                        createdAt: 1,
                        "packageCharge._id": 1,
                        "packageCharge.payInPackageName": 1,
                        "packageCharge.payInChargeRange": 1,
                        "packageCharge.isActive": 1
                    }
                }
            ]);

            if (!userInfo) return;

            const chargeRange = userInfo.packageCharge?.payInChargeRange || [];
            const payerAmount = qrGenDoc.amount;
            let chargeTypePayIn, chargeAmountPayIn;

            for (const value of chargeRange) {
                if (value.lowerLimit <= payerAmount && value.upperLimit > payerAmount) {
                    chargeTypePayIn = value.chargeType;
                    chargeAmountPayIn = value.charge;
                    break;
                }
            }

            const userChargeApply = chargeTypePayIn === "Flat" ? chargeAmountPayIn : (chargeAmountPayIn / 100) * payerAmount;
            
            const finalAmountAdd = payerAmount - userChargeApply;

            const payinDataStore = {
                memberId: qrGenDoc?.memberId,
                payerName: qrGenDoc?.name,
                trxId: qrGenDoc?.trxId,
                amount: payerAmount,
                chargeAmount: userChargeApply,
                finalAmount: finalAmountAdd,
                vpaId: reqPaymentObj.entity.vpa,
                bankRRN: reqPaymentObj.entity.acquirer_data.rrn,
                description: `Qr Generated Successfully Amount:${payerAmount} PayerVa:${reqPaymentObj.entity.vpa} BankRRN:${reqPaymentObj.entity.acquirer_data.rrn}`,
                trxCompletionDate: reqPaymentLinkObj.entity.created_at,
                trxInItDate: reqPaymentLinkObj.entity.updated_at,
                isSuccess: "Success"
            };

            const upiWalletDataObject = {
                memberId: userInfo._id,
                transactionType: "Cr.",
                transactionAmount: finalAmountAdd,
                beforeAmount: userInfo.upiWalletBalance,
                afterAmount: userInfo.upiWalletBalance + finalAmountAdd,
                description: `Successfully Cr. amount: ${finalAmountAdd} with transaction Id: ${qrGenDoc?.trxId}`,
                transactionStatus: "Success"
            };

            const callBackPayinUrls = await callBackResponseModel.find({
                memberId: userInfo._id,
                isActive: true
            }).select("payInCallBackUrl");

            const userCallBackURL = callBackPayinUrls[0]?.payInCallBackUrl;

            const userRespSendApi = {
                status: reqPaymentLinkObj.entity.status,
                payerAmount,
                payerName: qrGenDoc?.name,
                txnID: qrGenDoc?.trxId,
                BankRRN: reqPaymentObj.entity.acquirer_data.rrn,
                payerVA: reqPaymentObj.entity.vpa,
                TxnInitDate: reqPaymentLinkObj.entity.created_at,
                TxnCompletionDate: reqPaymentLinkObj.entity.updated_at
            }; 

            await Promise.all([
                qrGenDoc.save(),
                upiWalletModel.create(upiWalletDataObject),
                payInModel.create(payinDataStore),
                userDB.findByIdAndUpdate(userInfo._id, { upiWalletBalance: userInfo.upiWalletBalance + finalAmountAdd }),
                axios.post(userCallBackURL, userRespSendApi, {
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json"
                    }
                })
            ]);

            res.status(200).json(new ApiResponse(200, null, "Successfully"));
        } else if (req.event === "payment_link.failed") {
            return res.status(400).json({ succes: "Failed", message: "Txn Id Not Avabile!" })
        } else {
            return res.status(400).json({ succes: "Failed", message: "Txn Id Not Avabile!" })
        }
    } catch (error) {
        console.log("error=>", error.message);
        return res.status(400).json({ succes: "Failed", message: error.message || "Txn Id Not Avabile!" })

    } finally {
        release()
    }

})