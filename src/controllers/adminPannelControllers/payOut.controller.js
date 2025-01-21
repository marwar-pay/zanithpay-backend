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
// import { ApiError } from "../../utils/ApiError.js";
// import { getPaginationArray } from "../../utils/helpers.js";
import mongoose from "mongoose";
import { Parser } from "json2csv";

const genPayoutMutex = new Mutex();
const iSmartMutex = new Mutex();

export const allPayOutPayment = asyncHandler(async (req, res) => {
    let { page = 1, limit = 25, keyword = "", startDate, endDate, memberId, status, export: exportToCSV } = req.query;
    page = Number(page) || 1;
    limit = Number(limit) || 25;
    const skip = (page - 1) * limit;
    const trimmedKeyword = keyword.trim();
    const trimmedMemberId = memberId && mongoose.Types.ObjectId.isValid(String(memberId))
        ? new mongoose.Types.ObjectId(String(memberId.trim()))
        : null;
    const trimmedStatus = status ? status.trim() : "";

    let dateFilter = {};
    if (startDate) {
        dateFilter.$gte = new Date(startDate);
    }
    if (endDate) {
        endDate = new Date(endDate);
        endDate.setHours(23, 59, 59, 999);
        dateFilter.$lt = new Date(endDate);
    }

    let matchFilters = {
        ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
        ...(trimmedKeyword && {
            $or: [
                { trxId: { $regex: trimmedKeyword, $options: "i" } },
                { accountHolderName: { $regex: trimmedKeyword, $options: "i" } }
            ]
        }),
        ...(trimmedStatus && { isSuccess: { $regex: trimmedStatus, $options: "i" } }),
        ...(trimmedMemberId && { memberId: trimmedMemberId })
    };

    try {
        const totalDocs = await payOutModelGenerate.countDocuments(matchFilters);
        const sortDirection = Object.keys(dateFilter).length > 0 ? 1 : -1;
        const pipeline = [
            { $match: matchFilters },
            { $sort: { createdAt: sortDirection } },

            ...(exportToCSV != "true"
                ? [
                    { $skip: skip },
                    { $limit: limit }
                ]
                : []),

            {
                $lookup: {
                    from: "users",
                    localField: "memberId",
                    foreignField: "_id",
                    as: "userInfo",
                    pipeline: [
                        { $project: { userName: 1, fullName: 1, memberId: 1 } }
                    ],
                },
            },
            {
                $unwind: {
                    path: "$userInfo",
                    preserveNullAndEmptyArrays: false
                },
            },
            {
                $lookup: {
                    from: "payoutrecodes", // Replace with the correct collection name for payoutSuccess
                    localField: "trxId",
                    foreignField: "trxId", // Replace with the appropriate field for linking
                    as: "payoutSuccessData",
                    pipeline: [
                        { $project: { chargeAmount: 1, finalAmount: 1 } },
                    ],
                },
            },
            {
                $unwind: {
                    path: "$payoutSuccessData",
                    preserveNullAndEmptyArrays: true,
                },
            },
            ...(exportToCSV == "true"
                ? [{
                    $addFields: {
                        createdAt: {
                            $dateToString: {
                                format: "%Y-%m-%d %H:%M:%S",
                                date: {
                                    $add: ["$createdAt", 0] // Convert UTC to IST
                                },
                                timezone: "Asia/Kolkata"
                            }
                        }
                    }
                }] : []),
            {
                $project: {
                    "_id": 1,
                    "trxId": 1,
                    "accountHolderName": 1,
                    "optxId": 1,
                    "accountNumber": 1,
                    "ifscCode": 1,
                    "amount": 1,
                    "isSuccess": 1,
                    "payoutSuccessData.chargeAmount": 1,
                    "payoutSuccessData.finalAmount": 1,
                    "createdAt": 1,
                    "status": 1,
                    "userInfo.userName": 1,
                    "userInfo.fullName": 1,
                    "userInfo.memberId": 1,
                },
            }
        ];

        const aggregationOptions = {
            readPreference: 'secondaryPreferred'
        };

        const payment = await payOutModelGenerate.aggregate(pipeline, aggregationOptions).allowDiskUse(true);

        if (!payment || payment.length === 0) {
            return res.status(400).json({ message: "Failed", data: "No Transaction Available!" });
        }

        if (exportToCSV === "true") {
            const fields = [
                "_id",
                "trxId",
                "accountHolderName",
                "optxId",
                "accountNumber",
                "ifscCode",
                "amount",
                "isSuccess",
                { value: "payoutSuccessData.chargeAmount", label: "Charge Amount" },
                { value: "payoutSuccessData.finalAmount", label: "Final Amount" },
                "createdAt",
                "status",
                { value: "userInfo.userName", label: "User Name" },
                { value: "userInfo.fullName", label: "Full Name" },
                { value: "userInfo.memberId", label: "Member ID" }
            ];

            const json2csvParser = new Parser({ fields });
            const csv = json2csvParser.parse(payment);

            res.header('Content-Type', 'text/csv');
            res.attachment(`payoutPayments-${startDate}-${endDate}.csv`);

            return res.status(200).send(csv);
        }

        const response = {
            data: payment,
            totalDocs: totalDocs,
            totalPages: Math.ceil(totalDocs / limit),
            currentPage: page
        };

        res.status(200).json(new ApiResponse(200, payment, totalDocs));
    } catch (err) {
        res.status(500).json({ message: "Failed", data: `Internal Server Error: ${err.message}` });
    }
});

export const allPayOutPaymentSuccess = asyncHandler(async (req, res) => {
    let { page = 1, limit = 25, keyword = "", startDate, endDate } = req.query;
    page = Number(page) || 1;
    limit = Number(limit) || 25;
    const trimmedKeyword = keyword.trim();
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

    const pipeline = [
        {
            $match: {
                ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
                ...(trimmedKeyword && {
                    $or: [
                        { trxId: { $regex: trimmedKeyword, $options: "i" } },
                        { accountHolderName: { $regex: trimmedKeyword, $options: "i" } },
                        { "userInfo.userName": { $regex: trimmedKeyword, $options: "i" } },
                        { "userInfo.fullName": { $regex: trimmedKeyword, $options: "i" } },
                    ],
                }),
            },
        },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
            $lookup: {
                from: "users",
                localField: "memberId",
                foreignField: "_id",
                pipeline: [
                    { $project: { userName: 1, fullName: 1, memberId: 1 } },
                ],
                as: "userInfo",
            },
        },
        {
            $unwind: {
                path: "$userInfo",
                preserveNullAndEmptyArrays: true,
            },
        },
        ...(exportToCSV == "true"
            ? [{
                $addFields: {
                    createdAt: {
                        $dateToString: {
                            format: "%Y-%m-%d %H:%M:%S",
                            date: {
                                $add: ["$createdAt", 0] // Convert UTC to IST
                            },
                            timezone: "Asia/Kolkata"
                        }
                    }
                }
            }] : []),
        {
            $project: {
                "_id": 1,
                "trxId": 1,
                "accountHolderName": 1,
                "optxId": 1,
                "accountNumber": 1,
                "ifscCode": 1,
                "amount": 1,
                "chargeAmount": 1,
                "finalAmount": 1,
                "bankRRN": 1,
                "isSuccess": 1,
                "createdAt": 1,
                "userInfo.userName": 1,
                "userInfo.fullName": 1,
                "userInfo.memberId": 1,
            },
        },
    ];

    const aggregationOptions = {
        readPreference: 'secondaryPreferred'
    };

    try {
        const GetData = await payOutModel.aggregate(pipeline, aggregationOptions).allowDiskUse(true);

        if (!GetData || GetData.length === 0) {
            return res.status(400).json({ message: "Failed", data: "No Successful Transactions Available!" });
        }

        res.status(200).json(new ApiResponse(200, GetData));
    } catch (err) {
        res.status(500).json({ message: "Failed", data: `Internal Server Error: ${err.message}` });
    }
});

export const generatePayOut = asyncHandler(async (req, res) => {
    // const release = await genPayoutMutex.acquire();
    const {
        userName, authToken, mobileNumber, accountHolderName, accountNumber,
        ifscCode, trxId, amount, bankName
    } = req.body;

    try {
        if (amount < 1) {
            return res.status(400).json({ message: "Failed", data: `Amount must be 1 or more: ${amount}` });
        }

        const [user] = await userDB.aggregate([
            {
                $match: {
                    $and: [{ userName }, { trxAuthToken: authToken }, { isActive: true }]
                }
            },
            { $lookup: { from: "payoutswitches", localField: "payOutApi", foreignField: "_id", as: "payOutApi" } },
            { $unwind: "$payOutApi" },
            { $lookup: { from: "packages", localField: "package", foreignField: "_id", as: "package" } },
            { $unwind: "$package" },
            { $lookup: { from: "payoutpackages", localField: "package.packagePayOutCharge", foreignField: "_id", as: "packageCharge" } },
            { $unwind: "$packageCharge" },
            { $project: { "userName": 1, "memberId": 1, "EwalletBalance": 1, "minWalletBalance": 1, "payOutApi": 1, "packageCharge": 1 } }
        ]);

        if (!user) {
            return res.status(401).json({ message: "Failed", data: "Invalid Credentials or User Inactive!" });
        }

        const { payOutApi, packageCharge, EwalletBalance, minWalletBalance } = user;

        if (payOutApi.apiName === "ServerMaintenance") {
            return res.status(400).json({ message: "Failed", data: { status_msg: "Server Under Maintenance!", status: 400, trxID: trxId } });
        }

        const chargeDetails = packageCharge.payOutChargeRange.find(value => value.lowerLimit <= amount && value.upperLimit > amount);
        if (!chargeDetails) {
            return res.status(400).json({ message: "Failed", data: "Invalid package!" });
        }

        const chargeAmount = chargeDetails.chargeType === "Flat" ? chargeDetails.charge : (chargeDetails.charge / 100) * amount;
        const finalAmountDeduct = amount + chargeAmount;
        const usableBalance = EwalletBalance - minWalletBalance;

        if (finalAmountDeduct > EwalletBalance || finalAmountDeduct > usableBalance) {
            return res.status(400).json({ message: "Failed", data: `Insufficient funds. Usable: ${usableBalance}` });
        }

        const payOutModelGen = await payOutModelGenerate.create({
            memberId: user._id, mobileNumber, accountHolderName, accountNumber, ifscCode,
            amount, gatwayCharge: chargeAmount, afterChargeAmount: finalAmountDeduct, trxId
        });

        const release = await genPayoutMutex.acquire();
        // db locking with deducted amount 
        const walletDucdsession = await userDB.startSession();
        const transactionOptions = {
            readConcern: { level: 'linearizable' },
            writeConcern: { w: 'majority' },
            readPreference: { mode: 'primary' },
            maxTimeMS: 1500
        };
        // wallet deducted and store ewallet trx
        try {
            walletDucdsession.startTransaction(transactionOptions);
            const opts = { walletDucdsession };

            // update wallet 
            let userWallet = await userDB.findByIdAndUpdate(user?._id, { $inc: { EwalletBalance: - finalAmountDeduct } }, {
                returnDocument: 'after',
                walletDucdsession
            })

            // Perform the update within the transaction
            // let userWallet = await userDB.findById(user?._id, "_id EwalletBalance", opts)
            let afterAmount = userWallet?.EwalletBalance
            let beforeAmount = userWallet?.EwalletBalance + finalAmountDeduct;

            // userWallet.EwalletBalance -= finalAmountDeduct;
            // await userWallet.save(opts)


            // ewallet store 
            let walletModelDataStore = {
                memberId: user?._id,
                transactionType: "Dr.",
                transactionAmount: amount,
                beforeAmount: beforeAmount,
                chargeAmount: chargeAmount,
                afterAmount: afterAmount,
                description: `Successfully Dr. amount: ${Number(finalAmountDeduct)} with transaction Id: ${trxId}`,
                transactionStatus: "Success",
            }

            await walletModel.create([walletModelDataStore], opts)
            // Commit the transaction
            await walletDucdsession.commitTransaction();
            // console.log('Transaction committed successfully');
        } catch (error) {
            console.log(error)
            await walletDucdsession.abortTransaction();
            // console.error('Transaction aborted due to error:', error);
        }
        finally {
            walletDucdsession.endSession();
            release()
        }
        // db locking end

        const HeaderObj = {
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            epoch: String(Date.now())
        }
        const BodyObj = {
            beneName: accountHolderName,
            beneAccountNo: accountNumber,
            beneifsc: ifscCode,
            benePhoneNo: mobileNumber,
            clientReferenceNo: trxId,
            amount,
            fundTransferType: "IMPS",
            latlong: "22.8031731,88.7874172",
            pincode: 302012,
            custName: accountHolderName,
            custMobNo: mobileNumber,
            custIpAddress: "110.235.219.55",
            beneBankName: bankName
        }
        const headerSecrets = await AESUtils.EncryptRequest(HeaderObj, process.env.ENC_KEY)
        const BodyRequestEnc = await AESUtils.EncryptRequest(BodyObj, process.env.ENC_KEY)

        const apiConfig = {
            iServerEuApi: {
                url: payOutApi.apiURL,
                headers: {
                    'header_secrets': headerSecrets,
                    'pass_key': process.env.PASS_KEY,
                    'Content-Type': 'application/json'
                },
                data: {
                    RequestData: BodyRequestEnc
                },
                res: async (apiResponse) => {
                    console.log(apiResponse, "resp")
                    try {
                        if (apiResponse === "Ip validation Failed") {
                            // console.log("api failed")
                            const release = await genPayoutMutex.acquire();
                            // db locking with added amount 
                            const walletAddsession = await userDB.startSession();
                            const transactionOptions = {
                                readConcern: { level: 'local' },
                                writeConcern: { w: 'majority' },
                                maxTimeMS: 1500
                            };
                            // wallet deducted and store ewallet trx
                            try {
                                walletAddsession.startTransaction(transactionOptions);
                                const opts = { walletAddsession };

                                // update wallet 
                                let userWallet = await userDB.findByIdAndUpdate(user?._id, { $inc: { EwalletBalance: + finalAmountDeduct } }, {
                                    returnDocument: 'after',
                                    walletAddsession
                                })

                                let afterAmount = userWallet?.EwalletBalance
                                let beforeAmount = userWallet?.EwalletBalance - finalAmountDeduct;

                                // ewallet store 
                                let walletModelDataStore = {
                                    memberId: user?._id,
                                    transactionType: "Cr.",
                                    transactionAmount: amount,
                                    beforeAmount: beforeAmount,
                                    chargeAmount: chargeAmount,
                                    afterAmount: afterAmount,
                                    description: `Successfully Cr. amount: ${Number(finalAmountDeduct)} with transaction Id: ${trxId}`,
                                    transactionStatus: "Success",
                                }

                                await walletModel.create([walletModelDataStore], opts)
                                // Commit the transaction
                                await walletAddsession.commitTransaction();
                                // console.log('Transaction committed successfully');
                            } catch (error) {
                                console.log(error)
                                await walletAddsession.abortTransaction();
                                // console.error('Transaction aborted due to error:', error);
                            }
                            finally {
                                walletAddsession.endSession();
                                release()
                            }
                            payOutModelGen.isSuccess = "Failed";
                            await payOutModelGen.save();
                            let faliedResp = {
                                statusCode: "400",
                                txnID: trxId
                            }
                            return { message: "Failed", data: faliedResp }
                        }

                        let bankServerResp = apiResponse?.ResponseData
                        let BodyResponceDec = await AESUtils.decryptRequest(bankServerResp, process.env.ENC_KEY);
                        let BankJsonConvt = await JSON.parse(BodyResponceDec);

                        // if Success  
                        console.log("Success", bankServerResp?.subStatus, BankJsonConvt, "bank su status end")
                        if (BankJsonConvt?.subStatus === 0) {
                            console.log("Inside the Bank substatus 0 or Ssccess", BankJsonConvt.subStatus, typeof BankJsonConvt?.subStatus)
                            // on Success
                            let payoutDataStore = {
                                memberId: user?._id,
                                amount: amount,
                                chargeAmount: chargeAmount,
                                finalAmount: finalAmountDeduct,
                                bankRRN: BankJsonConvt?.rrn,
                                trxId: trxId,
                                optxId: BankJsonConvt?.transactionId,
                                isSuccess: "Success"
                            }
                            await payOutModel.create(payoutDataStore);
                            payOutModelGen.isSuccess = "Success"
                            await payOutModelGen.save()

                            let userRespPayOut = {
                                statusCode: 1,
                                status: 1,
                                trxId: BankJsonConvt?.clientReferenceNo,
                                opt_msg: BankJsonConvt?.statusDesc
                            }

                            console.log(userRespPayOut, "user resp send", userRespPayOut)
                            payoutCallBackResponse({ body: userRespPayOut })

                            return new ApiResponse(200, userRespPayOut)
                        } else {
                            console.log("insdie the subStatus = -1-2,2 ", bankServerResp)

                            const release = await genPayoutMutex.acquire();
                            const walletAddsession = await userDB.startSession();
                            const transactionOptions = {
                                readConcern: { level: 'linearizable' },
                                writeConcern: { w: 1 },
                                readPreference: { mode: 'primary' },
                                maxTimeMS: 1500
                            };
                            try {
                                walletAddsession.startTransaction(transactionOptions);
                                const opts = { walletAddsession };

                                // Perform the update within the transaction
                                let userWallet = await userDB.findById(user?._id, "_id EwalletBalance", opts)
                                let beforeAmount = userWallet?.EwalletBalance;

                                userWallet.EwalletBalance += finalAmountDeduct;
                                await userWallet.save(opts)

                                // ewallet store 
                                let walletModelDataStore = {
                                    memberId: user?._id,
                                    transactionType: "Cr.",
                                    transactionAmount: amount,
                                    beforeAmount: beforeAmount,
                                    chargeAmount: chargeAmount,
                                    afterAmount: beforeAmount + finalAmountDeduct,
                                    description: `Successfully Cr. amount: ${Number(finalAmountDeduct)} with transaction Id: ${trxId}`,
                                    transactionStatus: "Success",
                                }

                                await walletModel.create([walletModelDataStore], opts)
                                // Commit the transaction
                                await walletAddsession.commitTransaction();
                                // console.log('Transaction committed successfully');
                            } catch (error) {
                                console.log(error)
                                await walletAddsession.abortTransaction();
                                // console.error('Transaction aborted due to error:', error);
                            }
                            finally {
                                walletAddsession.endSession();
                                release()
                            }
                            payOutModelGen.isSuccess = "Failed"
                            await await payOutModelGen.save()

                            let respSend = {
                                statusCode: BankJsonConvt?.subStatus,
                                status: BankJsonConvt?.subStatus,
                                trxId: BankJsonConvt?.clientReferenceNo,
                                opt_msg: BankJsonConvt?.statusDesc
                            }
                            return { message: "Failed", data: respSend }
                        }
                        // console.log("Final console", BankJsonConvt)
                    } catch (error) {
                        console.log("server error section in error section")
                        console.log(error)
                        payOutModelGen.isSuccess = "Failed";
                        await payOutModelGen.save();
                        let respSend = {
                            statusCode: "400",
                            txnID: trxId
                        }
                        return { message: "Failed", data: respSend }

                    }

                }
            },
            MarwarpayApi: {
                url: payOutApi.apiURL,
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                data: {
                    txnID: trxId, amount, ifsc: ifscCode, account_no: accountNumber,
                    account_holder_name: accountHolderName, mobile: mobileNumber, response_type: 1
                }
            },
            waayupayPayOutApi: {
                url: payOutApi.apiURL,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': "application/json",
                    'mid': process.env.ISMART_PAY_MID,
                    'key': process.env.ISMART_PAY_ID
                },
                data: {
                    clientId: process.env.WAAYU_CLIENT_ID,
                    secretKey: process.env.WAAYU_SECRET_KEY,
                    number: String(mobileNumber),
                    amount: amount.toString(),
                    transferMode: "IMPS",
                    accountNo: accountNumber,
                    ifscCode,
                    beneficiaryName: accountHolderName,
                    vpa: "ajaybudaniya1@ybl",
                    clientOrderId: trxId
                },
                res: async (apiResponse) => {
                    const { statusCode, status, message, orderId, utr, clientOrderId } = apiResponse;

                    if (status == 1) {
                        let payoutDataStore = {
                            memberId: user?._id,
                            amount: amount,
                            chargeAmount: chargeAmount,
                            finalAmount: finalAmountDeduct,
                            bankRRN: utr,
                            trxId: trxId,
                            optxId: orderId,
                            isSuccess: "Success"
                        }
                        await payOutModel.create(payoutDataStore);
                        payOutModelGen.isSuccess = "Success"
                        await payOutModelGen.save()
                        let callBackBody = {
                            optxid: orderId,
                            status: "SUCCESS",
                            txnid: clientOrderId,
                            amount: amount,
                            rrn: utr,
                        }

                        customCallBackPayoutUser(user?._id, callBackBody)

                        let userREspSend = {
                            statusCode: statusCode || 0,
                            status: status || 0,
                            trxId: trxId || 0,
                            opt_msg: message || "null"
                        }
                        return new ApiResponse(200, userREspSend)
                    } else {
                        const release = await genPayoutMutex.acquire();
                        const walletAddsession = await userDB.startSession();
                        const transactionOptions = {
                            readConcern: { level: 'linearizable' },
                            writeConcern: { w: 'majority' },
                            readPreference: { mode: 'primary' },
                            maxTimeMS: 1500
                        };
                        // wallet deducted and store ewallet trx
                        try {
                            walletAddsession.startTransaction(transactionOptions);
                            const opts = { walletAddsession };

                            // update wallet 
                            let userWallet = await userDB.findByIdAndUpdate(user?._id, { $inc: { EwalletBalance: + finalAmountDeduct } }, {
                                returnDocument: 'after',
                                walletAddsession
                            })

                            let afterAmount = userWallet?.EwalletBalance
                            let beforeAmount = userWallet?.EwalletBalance - finalAmountDeduct;

                            // ewallet store 
                            let walletModelDataStore = {
                                memberId: user?._id,
                                transactionType: "Cr.",
                                transactionAmount: amount,
                                beforeAmount: beforeAmount,
                                chargeAmount: chargeAmount,
                                afterAmount: afterAmount,
                                description: `Successfully Cr. amount: ${Number(finalAmountDeduct)} with transaction Id: ${trxId}`,
                                transactionStatus: "Success",
                            }

                            await walletModel.create([walletModelDataStore], opts)
                            // Commit the transaction
                            await walletAddsession.commitTransaction();
                            // console.log('Transaction committed successfully');
                        } catch (error) {
                            console.log(error)
                            await walletAddsession.abortTransaction();
                            // console.error('Transaction aborted due to error:', error);
                        }
                        finally {
                            walletAddsession.endSession();
                            release()
                        }

                        payOutModelGen.isSuccess = "Failed"
                        await await payOutModelGen.save()
                        let userREspSend2 = {
                            statusCode: statusCode || 0,
                            status: status || 0,
                            trxId: trxId || 0,
                            opt_msg: message || "null"
                        }
                        return { message: "Failed", data: userREspSend2 }
                    }
                }
            },
            waayupayPayOutApiSecond: {
                url: payOutApi.apiURL,
                headers: { 'Content-Type': 'application/json', 'Accept': "application/json" },
                data: {
                    clientId: process.env.WAAYU_CLIENT_ID_TWO,
                    secretKey: process.env.WAAYU_SECRET_KEY_TWO,
                    number: String(mobileNumber),
                    amount: amount.toString(),
                    transferMode: "IMPS",
                    accountNo: accountNumber,
                    ifscCode,
                    beneficiaryName: accountHolderName,
                    vpa: "ajaybudaniya1@ybl",
                    clientOrderId: trxId
                },
                res: async (apiResponse) => {
                    const { statusCode, status, message, orderId, utr, clientOrderId } = apiResponse;

                    if (status == 1) {
                        let payoutDataStore = {
                            memberId: user?._id,
                            amount: amount,
                            chargeAmount: chargeAmount,
                            finalAmount: finalAmountDeduct,
                            bankRRN: utr,
                            trxId: trxId,
                            optxId: orderId,
                            isSuccess: "Success"
                        }
                        await payOutModel.create(payoutDataStore);
                        payOutModelGen.isSuccess = "Success"
                        await payOutModelGen.save()
                        let callBackBody = {
                            optxid: orderId,
                            status: "SUCCESS",
                            txnid: clientOrderId,
                            amount: amount,
                            rrn: utr,
                        }

                        customCallBackPayoutUser(user?._id, callBackBody)

                        let userREspSend = {
                            statusCode: statusCode || 0,
                            status: status || 0,
                            trxId: trxId || 0,
                            opt_msg: message || "null"
                        }
                        return new ApiResponse(200, userREspSend)
                    } else {
                        const release = await genPayoutMutex.acquire();
                        // db locking with added amount 
                        const walletAddsession = await userDB.startSession();
                        const transactionOptions = {
                            readConcern: { level: 'linearizable' },
                            writeConcern: { w: 'majority' },
                            readPreference: { mode: 'primary' },
                            maxTimeMS: 1500
                        };
                        // wallet added and store ewallet trx
                        try {
                            walletAddsession.startTransaction(transactionOptions);
                            const opts = { walletAddsession };

                            // Perform the update within the transaction
                            // update wallet 
                            let userWallet = await userDB.findByIdAndUpdate(user?._id, { $inc: { EwalletBalance: + finalAmountDeduct } }, {
                                returnDocument: 'after',
                                walletAddsession
                            })

                            let afterAmount = userWallet?.EwalletBalance
                            let beforeAmount = userWallet?.EwalletBalance - finalAmountDeduct;

                            // ewallet store 
                            let walletModelDataStore = {
                                memberId: user?._id,
                                transactionType: "Cr.",
                                transactionAmount: amount,
                                beforeAmount: beforeAmount,
                                chargeAmount: chargeAmount,
                                afterAmount: afterAmount,
                                description: `Successfully Cr. amount: ${Number(finalAmountDeduct)} with transaction Id: ${trxId}`,
                                transactionStatus: "Success",
                            }

                            await walletModel.create([walletModelDataStore], opts)
                            // Commit the transaction
                            await walletAddsession.commitTransaction();
                            // console.log('Transaction committed successfully');
                        } catch (error) {
                            console.log(error)
                            await walletAddsession.abortTransaction();
                            // console.error('Transaction aborted due to error:', error);
                        }
                        finally {
                            walletAddsession.endSession();
                            release()
                        }

                        payOutModelGen.isSuccess = "Failed"
                        await await payOutModelGen.save()
                        let userREspSend2 = {
                            statusCode: statusCode || 0,
                            status: status || 0,
                            trxId: trxId || 0,
                            opt_msg: message || "null"
                        }
                        return { message: "Failed", data: userREspSend2 }
                    }
                }
            },
            iSmartPayPayoutApi: {
                url: payOutApi?.apiURL,
                headers: { 'Content-Type': 'application/json', 'Accept': "application/json" },
                data: {
                    amount,
                    "currency": "INR",
                    "purpose": "refund",
                    "order_id": trxId,
                    "narration": "Fund Transfer",
                    "phone_number": String(mobileNumber),
                    "payment_details": {
                        "type": "NB",
                        "account_number": accountNumber,
                        "ifsc_code": ifscCode,
                        "beneficiary_name": accountHolderName,
                        "mode": "IMPS"
                    }
                },
                res: async (apiResponse) => {
                    const { status, status_code, message, transaction_id, amount, bank_id, order_id, purpose, narration, currency, wallet_id, wallet_name, created_on } = apiResponse;

                    if (status) {
                        let payoutDataStore = {
                            memberId: user?._id,
                            amount: amount,
                            chargeAmount: chargeAmount,
                            finalAmount: finalAmountDeduct,
                            bankRRN: bank_id,
                            trxId: order_id,
                            optxId: transaction_id,
                            isSuccess: "Success"
                        }
                        await payOutModel.create(payoutDataStore);
                        payOutModelGen.isSuccess = "Success"
                        await payOutModelGen.save()

                        let callBackBody = {
                            optxid: transaction_id,
                            status: "SUCCESS",
                            txnid: order_id,
                            amount: amount,
                            rrn: bank_id,
                        }

                        customCallBackPayoutUser(user?._id, callBackBody)


                        let userREspSend = {
                            statusCode: status_code || 0,
                            status: status || 0,
                            trxId: trxId || 0,
                            opt_msg: message || "null"
                        }
                        return new ApiResponse(200, userREspSend)
                    } else {
                        const release = await genPayoutMutex.acquire();
                        // db locking with added amount 
                        const walletAddsession = await userDB.startSession();
                        const transactionOptions = {
                            readConcern: { level: 'linearizable' },
                            writeConcern: { w: 'majority' },
                            readPreference: { mode: 'primary' },
                            maxTimeMS: 1500
                        };
                        // wallet deducted and store ewallet trx
                        try {
                            walletAddsession.startTransaction(transactionOptions);
                            const opts = { walletAddsession };

                            // update wallet 
                            let userWallet = await userDB.findByIdAndUpdate(user?._id, { $inc: { EwalletBalance: + finalAmountDeduct } }, {
                                returnDocument: 'after',
                                walletAddsession
                            })

                            let afterAmount = userWallet?.EwalletBalance
                            let beforeAmount = userWallet?.EwalletBalance - finalAmountDeduct;

                            // ewallet store 
                            let walletModelDataStore = {
                                memberId: user?._id,
                                transactionType: "Cr.",
                                transactionAmount: amount,
                                beforeAmount: beforeAmount,
                                chargeAmount: chargeAmount,
                                afterAmount: afterAmount,
                                description: `Successfully Cr. amount: ${Number(finalAmountDeduct)} with transaction Id: ${trxId}`,
                                transactionStatus: "Success",
                            }

                            await walletModel.create([walletModelDataStore], opts)
                            // Commit the transaction
                            await walletAddsession.commitTransaction();
                            // console.log('Transaction committed successfully');
                        } catch (error) {
                            console.log(error)
                            await walletAddsession.abortTransaction();
                            // console.error('Transaction aborted due to error:', error);
                        }
                        finally {
                            walletAddsession.endSession();
                            release()
                        }

                        payOutModelGen.isSuccess = "Failed"
                        await await payOutModelGen.save()
                        let userREspSend2 = {
                            statusCode: status_code || 0,
                            status: status || 0,
                            trxId: trxId || 0,
                            opt_msg: message || "null"
                        }
                        return { message: "Failed", data: userREspSend2 }
                    }

                }
            }
        };

        const apiResponse = await performPayoutApiCall(payOutApi, apiConfig);
        if (!apiResponse || typeof apiResponse != "object") {
            payOutModelGen.isSuccess = "Failed";
            await payOutModelGen.save();
            return res.status(500).json({ message: "Failed", data: { statusCode: 400, txnID: trxId } });
        }

        const response = await apiConfig[payOutApi.apiName]?.res(apiResponse)

        return res.status(200).json(response);
    } catch (error) {
        const errorMsg = error.code === 11000 ? "Duplicate key error!" : error.message;
        return res.status(400).json({ message: "Failed", data: errorMsg });
    }
    // finally {
    //     release();
    // }
});

export const performPayoutApiCall = async (payOutApi, apiConfig) => {

    const apiDetails = apiConfig[payOutApi?.apiName];
    if (!apiDetails) return null;

    try {
        const response = await axios.post(apiDetails.url, apiDetails.data, { headers: apiDetails.headers });

        return response?.data || null;
    } catch (error) {
        // console.log(error)
        if (error?.response?.data?.fault?.detail?.errorcode === "steps.accesscontrol.IPDeniedAccess") {
            return "Ip validation Failed"
        }
        // console.error(`API Call Error for ${payOutApi?.apiName}:`, error?.message);
        return `API Call Error for ${payOutApi?.apiName}: ${error?.message}`;
    }
};

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
    try {
        let callBackPayout = req.body;
        let data = { txnid: callBackPayout?.txnid, optxid: callBackPayout?.optxid, amount: callBackPayout?.amount, rrn: callBackPayout?.rrn, status: callBackPayout?.status }

        if (req.body.UTR) {
            data = { txnid: callBackPayout?.ClientOrderId, optxid: callBackPayout?.OrderId, amount: callBackPayout?.Amount, rrn: callBackPayout?.UTR, status: (callBackPayout?.Status == 1) ? "SUCCESS" : "Pending" }
        }

        if (data.status != "SUCCESS") {
            return res.status(400).json({ succes: "Failed", message: "Payment Failed Operator Side !" })
        }

        let getDocoment = await payOutModelGenerate.findOne({ trxId: data?.txnid });

        if (getDocoment?.isSuccess === "Success" || "Failed") {
            let userCallBackResp = await callBackResponse.aggregate([{ $match: { memberId: getDocoment.memberId } }]);

            let payOutUserCallBackURL = userCallBackResp[0]?.payOutCallBackUrl;
            const config = {
                headers: {
                    // 'Accept': 'application/json',
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

            try {
                await axios.post(payOutUserCallBackURL, shareObjData, config)
            } catch (error) {
                return
            }
            if (res) {
                return res.status(200).json({ message: "Failed", data: `Trx Status Already ${getDocoment?.isSuccess}` })
            }
            return
        }

        if (getDocoment && data?.rrn && getDocoment?.isSuccess === "Pending") {
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
            let userCallBackResp = await callBackResponse.aggregate([{ $match: { memberId: userInfo[0]?._id } }]);

            if (userCallBackResp.length !== 1) {
                return res.status(400).json({ message: "Failed", data: "User have multiple callback Url or Not Found !" })
            }

            let payOutUserCallBackURL = userCallBackResp[0]?.payOutCallBackUrl;
            const config = {
                headers: {
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

            try {
                await axios.post(payOutUserCallBackURL, shareObjData, config)
            } catch (error) {
                return
            }
            if (res) {
                return res.status(200).json(new ApiResponse(200, null, "Successfully !"))
            }
            return

        } else {
            return res.status(400).json({ message: "Failed", data: "Trx Id and user not Found !" })
        }
    } catch (error) {
        console.log(error)
        return res.status(400).json({ message: "Failed", data: "Internal server error !" })
    }
});

export const iSmartPayCallback = asyncHandler(async (req, res) => {
    const release = await iSmartMutex.acquire()
    try {
        const { status, status_code, message, transaction_id, amount, bank_id, order_id, purpose, narration, currency, created_on } = req.body
        let data = { txnid: order_id, optxid: transaction_id, amount: amount, rrn: bank_id, status: status ? "SUCCESS" : status }

        // if (req.body.bank_id) {
        //     data = { txnid: callBackPayout?.ClientOrderId, optxid: callBackPayout?.OrderId, amount: callBackPayout?.Amount, rrn: callBackPayout?.UTR, status: (callBackPayout?.Status == 1) ? "SUCCESS" : "Pending" }
        // }

        if (data.status != "SUCCESS") {
            return res.status(400).json({ succes: "Failed", message: message })
        }

        let getDocoment = await payOutModelGenerate.findOne({ trxId: data?.txnid });

        if (getDocoment?.isSuccess === "Success" || "Failed") {
            let userCallBackResp = await callBackResponse.aggregate([{ $match: { memberId: getDocoment.memberId } }]);

            let payOutUserCallBackURL = userCallBackResp[0]?.payOutCallBackUrl;
            const config = {
                headers: {
                    // 'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            };

            let shareObjData = {
                status: data?.status ? "SUCCESS" : "Failed",
                txnid: data?.txnid,
                optxid: data?.optxid,
                amount: data?.amount,
                rrn: data?.rrn
            }

            try {
                await axios.post(payOutUserCallBackURL, shareObjData, config)
            } catch (error) {
                return true
            }
            if (res) {
                return res.status(200).json({ message: "Failed", data: `Trx Status Already ${getDocoment?.isSuccess}` })
            }
            return true
        }

        if (getDocoment && data?.rrn && getDocoment?.isSuccess === "Pending") {
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
            let userCallBackResp = await callBackResponse.aggregate([{ $match: { memberId: userInfo[0]?._id } }]);

            if (userCallBackResp.length !== 1) {
                return res.status(400).json({ message: "Failed", data: "User have multiple callback Url or Not Found !" })
            }

            let payOutUserCallBackURL = userCallBackResp[0]?.payOutCallBackUrl;
            const config = {
                headers: {
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

            try {
                await axios.post(payOutUserCallBackURL, shareObjData, config)
            } catch (error) {
                return
            }
            if (res) {
                return res.status(200).json(new ApiResponse(200, null, "Successfully !"))
            }
            return

        } else {
            return res.status(400).json({ message: "Failed", data: "Trx Id and user not Found !" })
        }
    } catch (error) {

    } finally {
        release()
    }
})

const customCallBackPayoutUser = async (userId, Body) => {
    let callBackPayout = Body;
    let data = { txnid: callBackPayout?.txnid, optxid: callBackPayout?.optxid, amount: callBackPayout?.amount, rrn: callBackPayout?.rrn, status: callBackPayout?.status }

    // send callback to user
    // let userCallBackResp = await callBackResponse.aggregate([{ $match: { memberId: userId } }]);
    let userCallBackResp = await callBackResponse.findOne({ memberId: userId });

    if (!userCallBackResp) {
        return false
    }

    let payOutUserCallBackURL = userCallBackResp?.payOutCallBackUrl;
    const config = {
        headers: {
            // 'Accept': 'application/json',
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

    try {
        await axios.post(payOutUserCallBackURL, shareObjData, config)
    } catch (error) {
        null
    }
    return true
}
