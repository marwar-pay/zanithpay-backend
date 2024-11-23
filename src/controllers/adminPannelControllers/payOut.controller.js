import axios from "axios";
import payOutModelGenerate from "../../models/payOutGenerate.model.js";
import payOutModel from "../../models/payOutSuccess.model.js";
import walletModel from "../../models/Ewallet.model.js";
import callBackResponse from "../../models/callBackResponse.model.js";
import userDB from "../../models/user.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { AESUtils } from "../../utils/CryptoEnc.js";

export const allPayOutPayment = asyncHandler(async (req, res) => {
    let GetData = await payOutModelGenerate.aggregate([{ $lookup: { from: "users", localField: "memberId", foreignField: "_id", as: "userInfo" } },
    {
        $unwind: {
            path: "$userInfo",
            preserveNullAndEmptyArrays: true,
        }
    }, {
        $project: { "_id": 1, "trxId": 1, "accountHolderName": 1, "optxId": 1, "accountNumber": 1, "ifscCode": 1, "amount": 1, "isSuccess": 1, "chargeAmount": 1, "finalAmount": 1, "createdAt": 1, "userInfo.userName": 1, "userInfo.fullName": 1, "userInfo.memberId": 1 }
    }, { $sort: { createdAt: -1 } }]);
    res.status(200).json(new ApiResponse(200, GetData))
});

export const allPayOutPaymentSuccess = asyncHandler(async (req, res) => {
    let GetData = await payOutModel.aggregate([{ $lookup: { from: "users", localField: "memberId", foreignField: "_id", as: "userInfo" } },
    {
        $unwind: {
            path: "$userInfo",
            preserveNullAndEmptyArrays: true,
        }
    }, {
        $project: { "_id": 1, "trxId": 1, "accountHolderName": 1, "optxId": 1, "accountNumber": 1, "ifscCode": 1, "amount": 1, "chargeAmount": 1, "finalAmount": 1, "bankRRN": 1, "isSuccess": 1, "chargeAmount": 1, "finalAmount": 1, "createdAt": 1, "userInfo.userName": 1, "userInfo.fullName": 1, "userInfo.memberId": 1 }
    }, { $sort: { createdAt: -1 } }]);
    res.status(200).json(new ApiResponse(200, GetData))
});

export const generatePayOut = asyncHandler(async (req, res) => {
    const { userName, authToken, mobileNumber, accountHolderName, accountNumber, ifscCode, trxId, amount } = req.body;

    let user = await userDB.aggregate([{ $match: { $and: [{ userName: userName }, { trxAuthToken: authToken }, { isActive: true }] } }, { $lookup: { from: "payoutswitches", localField: "payOutApi", foreignField: "_id", as: "payOutApi" } }, {
        $unwind: {
            path: "$payOutApi",
            preserveNullAndEmptyArrays: true,
        }
    }, { $lookup: { from: "packages", localField: "package", foreignField: "_id", as: "package" } }, {
        $unwind: {
            path: "$package",
            preserveNullAndEmptyArrays: true,
        }
    }, { $lookup: { from: "payoutpackages", localField: "package.packagePayOutCharge", foreignField: "_id", as: "packageCharge" } }, {
        $unwind: {
            path: "$packageCharge",
            preserveNullAndEmptyArrays: true,
        }
    }, {
        $project: { "_id": 1, "userName": 1, "memberId": 1, "fullName": 1, "trxPassword": 1, "minWalletBalance": 1, "EwalletBalance": 1, "createdAt": 1, "payOutApi._id": 1, "payOutApi.apiName": 1, "payOutApi.apiURL": 1, "payOutApi.isActive": 1, "package._id": 1, "package.packageName": 1, "packageCharge._id": 1, "packageCharge.payOutChargeRange": 1, "packageCharge.isActive": 1 }
    }])

    if (user.length === 0) {
        return res.status(401).json({ message: "Failed", date: "Invalid Credentials or User Deactive !" })
    }

    // if (true) {
    //     let BodyObj = {
    //         beneName: "Ajay Kumar",
    //         beneAccountNo: "2211217740244935",
    //         beneifsc: "AUBL0002177",
    //         benePhoneNo: 9177756865,
    //         clientReferenceNo: "DdsfAD8783268F09C",
    //         amount: 101,
    //         fundTransferType: "IMPS",
    //         latlong: "22.8031731,88.7874172",
    //         pincode: 751004,
    //         custName: "Ajay Kumar",
    //         custMobNo: 8000623206,
    //         custIpAddress: "110.235.219.55",
    //         beneBankName: "AU SMALL FINANCE BANK",
    //         paramA: "",
    //         paramB: ""
    //     }

    //     let EncKey = "a6T8tOCYiSzDTrcqPvCbJfy0wSQOVcfaevH0gtwCtoU="
    //     let EncryptedBodyReq = await AESUtils.EncryptRequest(BodyObj, EncKey)
    //     console.log(EncryptedBodyReq)
    //     return res.status(200).json({ data: user, enc: EncryptedBodyReq, message: "Success" })
    // }

    let chargeRange = user[0]?.packageCharge?.payOutChargeRange;
    let chargeType;
    let chargeAmout;

    chargeRange.forEach((value) => {
        if (value.lowerLimit <= amount && value.upperLimit > amount) {
            chargeType = value.chargeType
            chargeAmout = value.charge
            return 0;
        }
    })

    let userChargeApply;
    let userUseAbelBalance;
    let finalAmountDeduct;

    if (chargeType === "Flat") {
        userChargeApply = chargeAmout;
        userUseAbelBalance = user[0]?.EwalletBalance - user[0]?.minWalletBalance;
        finalAmountDeduct = amount + userChargeApply;
    } else {
        userChargeApply = (chargeAmout / 100) * amount;
        userUseAbelBalance = user[0]?.EwalletBalance - user[0]?.minWalletBalance;
        finalAmountDeduct = amount + userChargeApply;
    }

    if (finalAmountDeduct > user[0]?.EwalletBalance) {
        return res.status(400).json({ message: "Failed", date: `Insufficient Fund usable Amount: ${userUseAbelBalance}` })
    }

    // if the data is lese then the amount the data
    if (finalAmountDeduct > userUseAbelBalance) {
        return res.status(400).json({ message: "Failed", data: `Insufficient Balance Holding Amount :${user[0]?.minWalletBalance} and Usable amount + charge amount less then ${userUseAbelBalance}` })
    }

    let userStoreData = {
        memberId: user[0]._id,
        mobileNumber: mobileNumber,
        accountHolderName: accountHolderName,
        accountNumber: accountNumber,
        ifscCode: ifscCode,
        amount: amount,
        afterChargeAmount: finalAmountDeduct,
        trxId: trxId
    }

    // let data = await payOutModelGenerate.create(userStoreData);

    // Payout data store successfully and send to the banking side
    const payOutApi = user[0]?.payOutApi;
    // const payOutApi = "https://www.marwarpay.in/portal/api/transferAuth";
    // const postApiOptions = {
    //     headers: {
    //         'MemberID': "MPAPI903851",
    //         'TXNPWD': "AB23",
    //         'Content-Type': 'multipart/form-data'
    //     }
    // };
    // const payoutApiDataSend =
    // {
    //     txnID: trxId,
    //     amount: amount,
    //     ifsc: ifscCode,
    //     account_no: accountNumber,
    //     account_holder_name: accountHolderName,
    //     mobile: mobileNumber,
    //     response_type: 1
    // }
    var postApiOptions;
    var payoutApiDataSend;

    switch (payOutApi?.apiName) {
        case "iServerEuApi":
            postApiOptions = {
                headers: {
                    'header_secrets': "Y1a+87erGXpruIFkSsk4517T3GWGOtvxfOvYq0oWVzNFiCV2hCQtCAjcWuvhA7dqf3PKfcTDbPpPGCZ1iI4xsG9nwNQvSihwNkYwY7V3+PNSUEOLZhFQs85SSxjZN/RuvexCZ5Weez18REQxpPnbRVloAlimcxkogHEXsZdNpb2LyiTn2SgmEgFp1ZEToPYesNOUwjJJGPtbgpa+/RY2iJscKEMELpnmOiILJM+utpxGrjw6ujUegT5vQtJmq2D5",
                    'pass_key': "ZDBJKROB5QEZKJ4MZ66G562ZTB4MTWDC7EXXU4GYASPXOJZMH4CQ",
                    'Content-Type': 'application/json'
                }
            };
            payoutApiDataSend =
            {
                RequestData: "3Qi+ibjEprukq0b9t630keOi/C81Kqb15Nj8b4jLL6ZoqaASb2Pg2TUC7xIL61giX662UEwnVlaxQf6S9y3LEqiGVEc1KnlDICb5tzuqebmxqgNh4B81GJMGo/YqG+I0jwNdxofzrUSB6wIL6AO6M+KZWU1G4NGd4sTI/OcZNKAwGB/KLEpNahw1kKZ++wDkBR+iLfI8LvkvZXBkeKiOcjXMihXnNRaZzSSZpzVxWIMOXrgZyV1AEeTaNgmj8Aq/xWi0Vb2bFLDtmb1IU46eAcN2rxyGlhNKmTviYsHC0664LJRkuUoNb5jPNIvyOIMS2WNTnZnMJ1mqdUM5dJLtk0UMu2Def/+A/jTVFRicZAH7YeTktqOFRYBaXHYcfeNhar3rC5RB4e5miJ5QAJTofD/gX/+gQu/IzY29obUAo8Pf/2E8ve0qZR1FsaHFvIZzyohrgouDt2eRNl4eLnUMrTmWLXMMACmjX3KNU5WxiuQfMKDTT6udvmspmu2ZwD8y8XSlpjkJJBfutHddgVCKpQ=="
            }
            break;
        case "MarwarpayApi":
            postApiOptions = {
                headers: {
                    'MemberID': "MPAPI903851",
                    'TXNPWD': "AB23",
                    'Content-Type': 'multipart/form-data'
                }
            };
            payoutApiDataSend =
            {
                txnID: trxId,
                amount: amount,
                ifsc: ifscCode,
                account_no: accountNumber,
                account_holder_name: accountHolderName,
                mobile: mobileNumber,
                response_type: 1
            }
            break;
        default:
            console.log("Hello")
            break;
    }
    // if (true) {
    //     console.log(payOutApi)
    //     return res.status(200).json({ message: "success", data: { payOutApi, postApiOptions, payoutApiDataSend } })
    // }

    axios.post(payOutApi?.apiURL, payoutApiDataSend, postApiOptions).then((data) => {
        let bankServerResp = data?.data
        return res.status(200).json(new ApiResponse(200, bankServerResp))
    }).catch((err) => {
        return res.status(500).json({ message: "Failed", data: "Internel Server Error !" })
    })
    //  banking side api call end 
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
    let callBackPayout = req.body
    let data = { txnid: callBackPayout?.txnid, optxid: callBackPayout?.optxid, amount: callBackPayout?.amount, rrn: callBackPayout?.rrn, status: callBackPayout?.status }

    if (data.status != "SUCCESS") {
        return res.status(400).json({ succes: "Failed", message: "Payment Failed Operator Side !" })
    }

    // get the trxid Data 
    let getDocoment = await payOutModelGenerate.findOne({ trxId: data.txnid });

    if (getDocoment && data?.rrn) {
        getDocoment.isSuccess = "Success"
        await getDocoment.save();

        let userInfo = await userDB.aggregate([{ $match: { _id: getDocoment?.memberId } }, { $lookup: { from: "payoutswitches", localField: "payOutApi", foreignField: "_id", as: "payOutApi" } }, {
            $unwind: {
                path: "$payOutApi",
                preserveNullAndEmptyArrays: true,
            }
        }, {
            $project: { "_id": 1, "userName": 1, "memberId": 1, "fullName": 1, "trxPassword": 1, "EwalletBalance": 1, "createdAt": 1, "payOutApi._id": 1, "payOutApi.apiName": 1, "payOutApi.apiURL": 1, "payOutApi.isActive": 1 }
        }]);

        let chargePaymentGatway = getDocoment?.afterChargeAmount - getDocoment?.amount;
        let mainAmount = getDocoment?.amount;

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
        userWalletInfo.EwalletBalance -= getDocoment?.afterChargeAmount
        await userWalletInfo.save();

        let storeTrx = await walletModel.create(walletModelDataStore)

        let payoutDataStore = {
            memberId: getDocoment?.memberId,
            amount: mainAmount,
            chargeAmount: chargePaymentGatway,
            finalAmount: getDocoment?.afterChargeAmount,
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
        const config = {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        };

        let shareObjData = {
            status: req.body.status,
            txnid: req.body.txnid,
            optxid: req.body.optxid,
            amount: req.body.amount,
            rrn: req.body.rrn
        }

        let dataApi = await axios.post(payOutUserCallBackURL, shareObjData, config)
        return res.status(200).json(new ApiResponse(200, dataApi.data, "Successfully !"))

        // end the user callback calling and send response 
    } else {
        res.status(400).json({ message: "Failed", data: "Trx Id and user not Found !" })
    }

});