import axios from "axios";
import payOutModelGenerate from "../../models/payOutGenerate.model.js";
import payOutModel from "../../models/payOutSuccess.model.js";
import walletModel from "../../models/Ewallet.model.js";
import callBackResponse from "../../models/callBackResponse.model.js";
import userDB from "../../models/user.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { AESUtils } from "../../utils/CryptoEnc.js";
import { Mutex } from "async-mutex";

const genPayoutMutex = new Mutex();
const payoutCallbackMutex = new Mutex();

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
    const { userName, authToken, mobileNumber, accountHolderName, accountNumber, ifscCode, trxId, amount, bankName } = req.body;
    const release = await genPayoutMutex.acquire()
    try {
        if (amount < 1) {
            return res.status(400).json({ message: "Failed", data: `Amount 1 or More: ${amount}` })
        }

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

        let chargeRange = user[0]?.packageCharge?.payOutChargeRange;
        var chargeType;
        var chargeAmout;

        chargeRange.forEach((value) => {
            if (value.lowerLimit <= amount && value.upperLimit > amount) {
                chargeType = value.chargeType
                chargeAmout = value.charge
                return 0;
            }
        })

        if (chargeAmout === undefined || chargeType === undefined) {
            return res.status(400).json({ message: "Failed", data: "Not Valid package !" })
        }

        var userChargeApply;
        var userUseAbelBalance;
        var finalAmountDeduct;

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
            gatwayCharge: userChargeApply,
            afterChargeAmount: finalAmountDeduct,
            trxId: trxId
        }

        let payOutModelGen = await payOutModelGenerate.create(userStoreData);

        // ewallet balance deducted
        let userEwalletBalance = await userDB.findById(user[0]._id, { EwalletBalance: 1 })

        // Payout data store successfully and send to the banking side
        const payOutApi = user[0]?.payOutApi;

        var postApiOptions;
        var payoutApiDataSend;

        switch (payOutApi?.apiName) {
            case "iServerEuApi":
                const passKey = "Fv5S9m79z7rUq0LG7NE4VW4GIICNPaZYPnngonlvdkxNU902";
                const EncKey = "8LWVEmyHYcJZjjB0WW2VQ+YDttzua5BGMnOX66Vi5KE=";
                let HeaderObj = {
                    client_id: "ZYSEZxHszNlEzMuihWIltIqClSVFqqQeUbPYTfpjKMQiDXKJ",
                    client_secret: "r5kOP0Rdxj4qYjbRFHyUKHetEGTOH1ZaHUgz4p5xqFw3aYxVvGDuFrGcHDKKudFa",
                    epoch: String(Date.now())
                }
                let BodyObj = {
                    beneName: accountHolderName,
                    beneAccountNo: accountNumber.toString(),
                    beneifsc: ifscCode,
                    benePhoneNo: mobileNumber,
                    clientReferenceNo: trxId,
                    amount: amount,
                    fundTransferType: "IMPS",
                    latlong: "22.8031731,88.7874172",
                    pincode: 302012,
                    custName: accountHolderName,
                    custMobNo: mobileNumber,
                    custIpAddress: "110.235.219.55",
                    beneBankName: bankName,
                }
                let headerSecrets = await AESUtils.EncryptRequest(HeaderObj, EncKey)
                let BodyRequestEnc = await AESUtils.EncryptRequest(BodyObj, EncKey)
                postApiOptions = {
                    headers: {
                        'header_secrets': headerSecrets,
                        'pass_key': passKey,
                        'Content-Type': 'application/json'
                    }
                };
                payoutApiDataSend =
                {
                    RequestData: BodyRequestEnc
                }

                // Banking api calling
                axios.post(payOutApi?.apiURL, payoutApiDataSend, postApiOptions).then(async (data) => {
                    let bankServerResp = data?.data?.ResponseData
                    // decrypt the data and send to client;
                    let BodyResponceDec = await AESUtils.decryptRequest(bankServerResp, EncKey);
                    let BankJsonConvt = await JSON.parse(BodyResponceDec);

                    if (BankJsonConvt.subStatus == -1 || 2 || -2) {
                        payOutModelGen.isSuccess = "Failed";
                        await payOutModelGen.save();
                        // return res.status(200).json({ message: BankJsonConvt})
                    }

                    let userRespPayOut = {
                        statusCode: BankJsonConvt?.subStatus,
                        status: BankJsonConvt?.status,
                        trxId: BankJsonConvt?.clientReferenceNo,
                        opt_msg: BankJsonConvt?.statusDesc
                    }

                    return res.status(200).json(new ApiResponse(200, userRespPayOut))
                }).catch(async (err) => {
                    payOutModelGen.isSuccess = "Failed";
                    await payOutModelGen.save();
                    let respSend = {
                        statusCode: "400",
                        txnID: trxId
                    }
                    return res.status(500).json({ message: "Failed", data: respSend })
                })
                //  banking side api call end 
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
                // banking api calling
                axios.post(payOutApi?.apiURL, payoutApiDataSend, postApiOptions).then((data) => {
                    let bankServerResp = data?.data
                    return res.status(200).json(new ApiResponse(200, bankServerResp))
                }).catch((err) => {
                    return res.status(500).json({ message: "Failed", data: "Internel Server Error !" })
                })
                //  banking side api call end 
                break;
            case "waayupayPayOutApi":
                postApiOptions = {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': "application/json"
                    }
                };
                payoutApiDataSend =
                {
                    clientId: "adb25735-69c7-4411-a120-5f2e818bdae5",
                    secretKey: "6af59e5a-7f28-4670-99ae-826232b467be",
                    number: mobileNumber.toString(),
                    amount: amount.toString(),
                    transferMode: "IMPS",
                    accountNo: accountNumber.toString(),
                    ifscCode: ifscCode,
                    beneficiaryName: accountHolderName,
                    vpa: "ajaybudaniya1@ybl",
                    clientOrderId: trxId
                }

                let userEwalletBalanceBefore = userEwalletBalance.EwalletBalance;
                userEwalletBalance.EwalletBalance = userEwalletBalance.EwalletBalance - finalAmountDeduct;
                await userEwalletBalance.save();

                // ewallet balance Store 
                let walletModelDataStore = {
                    memberId: userEwalletBalance._id,
                    transactionType: "Dr.",
                    transactionAmount: amount,
                    beforeAmount: userEwalletBalanceBefore,
                    chargeAmount: userChargeApply,
                    afterAmount: userEwalletBalanceBefore - finalAmountDeduct,
                    description: `Successfully Dr. amount: ${finalAmountDeduct}`,
                    transactionStatus: "Success",
                }

                let storeTrx = await walletModel.create(walletModelDataStore)

                // banking api calling
                axios.post(payOutApi?.apiURL, payoutApiDataSend, postApiOptions).then(async (data) => {
                    let bankServerResp = data?.data;

                    // Banking side success resp
                    if (bankServerResp?.status === 1) {
                        let payoutDataStore = {
                            memberId: userEwalletBalance?._id,
                            amount: amount,
                            chargeAmount: userChargeApply,
                            finalAmount: finalAmountDeduct,
                            bankRRN: bankServerResp?.utr,
                            trxId: trxId,
                            optxId: bankServerResp?.orderId,
                            isSuccess: "Success"
                        }

                        await payOutModel.create(payoutDataStore)
                        await payOutModelGenerate.findByIdAndUpdate(payOutModelGen._id, { isSuccess: "Success" })

                        let userCustomCallBackGen = {
                            StatusCode: bankServerResp?.statusCode,
                            Message: bankServerResp?.message,
                            OrderId: bankServerResp?.orderId,
                            Status: bankServerResp?.status,
                            ClientOrderId: bankServerResp?.clientOrderId,
                            PaymentMode: "IMPS",
                            Amount: bankServerResp?.amount,
                            Date: new Date().toString(),
                            UTR: bankServerResp?.utr,
                        }

                        let postSelfURl = "http://localhost:5000/apiAdmin/v1/payout/payoutCallBackResponse";
                        let selfApiHeadersOPT = {
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': "application/json"
                            }
                        };
                        axios.post(postSelfURl, userCustomCallBackGen, selfApiHeadersOPT);
                    }

                    // failed from bank side
                    else if (bankServerResp?.status === 0 || 4) {
                        await payOutModelGenerate.findByIdAndUpdate(payOutModelGen._id, { isSuccess: "Failed" })

                        userEwalletBalance.EwalletBalance = userEwalletBalance.EwalletBalance + finalAmountDeduct;
                        await userEwalletBalance.save()

                        // ewallet balance Store 
                        let walletModelDataStoreCR = {
                            memberId: userEwalletBalance._id,
                            transactionType: "Cr.",
                            transactionAmount: amount,
                            beforeAmount: userEwalletBalance.EwalletBalance,
                            chargeAmount: userChargeApply,
                            afterAmount: userEwalletBalance.EwalletBalance + finalAmountDeduct,
                            description: `Successfully Cr. amount: ${finalAmountDeduct}`,
                            transactionStatus: "Success",
                        }
                        await walletModel.create(walletModelDataStoreCR)
                    }

                    let userRespSend = {
                        statusCode: bankServerResp?.statusCode,
                        status: bankServerResp?.status,
                        trxId: bankServerResp?.clientOrderId,
                        opt_msg: bankServerResp?.message
                    }
                    return res.status(200).json(new ApiResponse(200, userRespSend))
                }).catch((err) => {
                    return res.status(500).json({ message: "Failed", data: "Internel Server Error !" })
                })
                //  banking side api call end 
                break;
            default:
                let respSend = {
                    statusCode: "400",
                    txnID: trxId
                }
                return res.status(400).json({ message: "Failed", data: respSend })
        }
    } catch (error) {
        return res.status(400).json({ message: "Failed", data: "Internal server error !" })
    } finally {
        release()
    }

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
    // const release = await payoutCallbackMutex.acquire()
    try {
        let callBackPayout = req.body;
        let data = { txnid: callBackPayout?.txnid, optxid: callBackPayout?.optxid, amount: callBackPayout?.amount, rrn: callBackPayout?.rrn, status: callBackPayout?.status }

        if (req.body.UTR) {
            data = { txnid: callBackPayout?.ClientOrderId, optxid: callBackPayout?.OrderId, amount: callBackPayout?.Amount, rrn: callBackPayout?.UTR, status: (callBackPayout?.Status == 1) ? "SUCCESS" : "Pending" }
        }

        if (data.status != "SUCCESS") {
            return res.status(400).json({ succes: "Failed", message: "Payment Failed Operator Side !" })
        }

        // get the trxid Data 
        let getDocoment = await payOutModelGenerate.findOne({ trxId: data?.txnid });

        if (getDocoment?.isSuccess === "Success" || "Failed") {
            // callback response to the 
            let userCallBackResp = await callBackResponse.aggregate([{ $match: { memberId: getDocoment.memberId } }]);

            let payOutUserCallBackURL = userCallBackResp[0]?.payOutCallBackUrl;
            // Calling the user callback and send the response to the user 
            const config = {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            };

            let shareObjData = {
                status: data?.status,
                txnid: data?.txnid,
                optxid: data?.optxid,
                amount: data?.amount,
                rrn: data?.rrn
            }

            await axios.post(payOutUserCallBackURL, shareObjData, config)
            return res.status(200).json({ message: "Failed", data: `Trx Status Already ${getDocoment?.isSuccess}` })
        }

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

            let chargePaymentGatway = getDocoment?.gatwayCharge;
            let mainAmount = getDocoment?.amount;

            let userWalletInfo = await userDB.findById(userInfo[0]?._id, "_id EwalletBalance");
            let beforeAmountUser = userWalletInfo.EwalletBalance;
            let finalEwalletDeducted = mainAmount + chargePaymentGatway;

            let walletModelDataStore = {
                memberId: userWalletInfo._id,
                transactionType: "Dr.",
                transactionAmount: data?.amount,
                beforeAmount: beforeAmountUser,
                chargeAmount: chargePaymentGatway,
                afterAmount: beforeAmountUser - finalEwalletDeducted,
                description: `Successfully Dr. amount: ${finalEwalletDeducted}`,
                transactionStatus: "Success",
            }

            // update the user wallet balance 
            userWalletInfo.EwalletBalance -= finalEwalletDeducted
            await userWalletInfo.save();

            let storeTrx = await walletModel.create(walletModelDataStore)

            let payoutDataStore = {
                memberId: getDocoment?.memberId,
                amount: mainAmount,
                chargeAmount: chargePaymentGatway,
                finalAmount: finalEwalletDeducted,
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
                status: data?.status,
                txnid: data?.txnid,
                optxid: data?.optxid,
                amount: data?.amount,
                rrn: data?.rrn
            }

            let dataApi = await axios.post(payOutUserCallBackURL, shareObjData, config)
            return res.status(200).json(new ApiResponse(200, null, "Successfully !"))

            // end the user callback calling and send response 
        } else {
            res.status(400).json({ message: "Failed", data: "Trx Id and user not Found !" })
        }
    } catch (error) {
        res.status(400).json({ message: "Failed", data: "Internal server error !" })
    } finally {
        // release()
    }

});