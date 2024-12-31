import cron from "node-cron";
import axios from "axios";
import userDB from "../models/user.model.js";
import payOutModelGenerate from "../models/payOutGenerate.model.js";
import walletModel from "../models/Ewallet.model.js";
import payOutModel from "../models/payOutSuccess.model.js";
import LogModel from "../models/Logs.model.js";
import { Mutex } from "async-mutex";
import qrGenerationModel from "../models/qrGeneration.model.js";
import oldQrGenerationModel from "../models/oldQrGeneration.model.js";
import mongoose from "mongoose";
import Log from "../models/Logs.model.js";
import callBackResponseModel from "../models/callBackResponse.model.js";
import payInModel from "../models/payIn.model.js";
import moment from "moment";
import upiWalletModel from "../models/upiWallet.model.js";
import EwalletModel from "../models/Ewallet.model.js";
const transactionMutex = new Mutex();
const logsMutex = new Mutex();
const loopMutex = new Mutex();

// function scheduleWayuPayOutCheck() {
//     cron.schedule('*/30 * * * *', async () => {
//         const release = await transactionMutex.acquire();
//         try {
//             let GetData = await payOutModelGenerate.find({ isSuccess: "Pending" }).limit(500);
//             if (GetData.length !== 0) {
//                 GetData.forEach(async (item) => {
//                     let uatUrl = "https://api.waayupay.com/api/api/api-module/payout/status-check"
//                     let postAdd = {
//                         clientId: "adb25735-69c7-4411-a120-5f2e818bdae5",
//                         secretKey: "6af59e5a-7f28-4670-99ae-826232b467be",
//                         clientOrderId: item.trxId
//                     }
//                     let header = {
//                         header: {
//                             "Accept": "application/json",
//                             "Content-Type": "application/json"
//                         }
//                     }

//                     await axios.post(uatUrl, postAdd, header).then(async (data) => {
//                         if (data?.data?.status !== 1) {
//                             await payOutModelGenerate.findByIdAndUpdate(item._id, { isSuccess: "Failed" })
//                         }

//                         else if (data?.data?.status === 1) {
//                             let userWalletInfo = await userDB.findById(item?.memberId, "_id EwalletBalance");
//                             let beforeAmountUser = userWalletInfo.EwalletBalance;
//                             let finalEwalletDeducted = item?.afterChargeAmount;
//                             await payOutModelGenerate.findByIdAndUpdate(item._id, { isSuccess: "Success" })

//                             let walletModelDataStore = {
//                                 memberId: userWalletInfo._id,
//                                 transactionType: "Dr.",
//                                 transactionAmount: item?.amount,
//                                 beforeAmount: beforeAmountUser,
//                                 chargeAmount: item?.gatwayCharge || item?.afterChargeAmount - item?.amount,
//                                 afterAmount: beforeAmountUser - finalEwalletDeducted,
//                                 description: `Successfully Dr. amount: ${finalEwalletDeducted}`,
//                                 transactionStatus: "Success",
//                             }

//                             // update the user wallet balance 
//                             userWalletInfo.EwalletBalance -= finalEwalletDeducted
//                             await userWalletInfo.save();

//                             let storeTrx = await walletModel.create(walletModelDataStore)

//                             let payoutDataStore = {
//                                 memberId: item?.memberId,
//                                 amount: item?.amount,
//                                 chargeAmount: item?.gatwayCharge || item?.afterChargeAmount - item?.amount,
//                                 finalAmount: finalEwalletDeducted,
//                                 bankRRN: data?.data?.utr,
//                                 trxId: data?.data?.clientOrderId,
//                                 optxId: data?.data?.orderId,
//                                 isSuccess: "Success"
//                             }

//                             await payOutModel.create(payoutDataStore)
//                         }

//                     }).catch((err) => {
//                         console.log(err.message)
//                     })
//                 })
//             }
//         } catch (error) {
//             console.log(error)
//         } finally {
//             release()
//         }
//     });
// }

function scheduleWayuPayOutCheck() {
    cron.schedule('*/10 * * * *', async () => {
        let GetData = await payOutModelGenerate.find({ isSuccess: "Pending" }).sort({ "createdAt": 1 }).limit(20);
        try {
            GetData.forEach(async (item) => {
                await processWaayuPayOutFn(item)
            });
        } catch (error) {
            console.error('Error during payout check:', error.message);
        }
    });
}

async function processWaayuPayOutFn(item) {
    const uatUrl = "https://api.waayupay.com/api/api/api-module/payout/status-check";
    const postAdd = {
        clientId: "adb25735-69c7-4411-a120-5f2e818bdae5",
        secretKey: "6af59e5a-7f28-4670-99ae-826232b467be",
        clientOrderId: item?.trxId,
    };
    const header = {
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
    };

    const { data } = await axios.post(uatUrl, postAdd, header);
    const session = await userDB.startSession({ readPreference: 'primary', readConcern: { level: "majority" }, writeConcern: { w: "majority" } });
    const release = await transactionMutex.acquire();
    try {
        session.startTransaction();
        const opts = { session };

        console.log(data)

        if (data?.status === null) {
            await session.abortTransaction();
            return false
        }

        // Non-transactional operation can be done outside the critical section
        if (data?.status !== 1) {
            console.log("failed added Status");
            await payOutModelGenerate.findByIdAndUpdate(item._id, { isSuccess: "Failed" }, opts);
            // Use Promise.all for parallel execution of independent tasks
            const userWalletInfo = await userDB.findById(item?.memberId, "_id EwalletBalance", opts)

            const beforeAmountUser = userWalletInfo?.EwalletBalance;
            const finalEwalletDeducted = item?.afterChargeAmount;

            userWalletInfo.EwalletBalance += finalEwalletDeducted;
            await userWalletInfo.save(opts);

            const walletModelDataStore = {
                memberId: userWalletInfo._id,
                transactionType: "Cr.",
                transactionAmount: item?.amount,
                beforeAmount: beforeAmountUser,
                chargeAmount: item?.gatwayCharge || item?.afterChargeAmount - item?.amount,
                afterAmount: beforeAmountUser + finalEwalletDeducted,
                description: `Successfully Cr. amount: ${finalEwalletDeducted} with :${item?.trxId}`,
                transactionStatus: "Success",
            };

            await walletModel.create([walletModelDataStore], opts)
            await session.commitTransaction();
            return true;

        }

        else if (data?.status === 1) {
            // Final update and commit in transaction
            let payoutModelData = await payOutModelGenerate.findByIdAndUpdate(item?._id, { isSuccess: "Success" }, { session, new: true });
            console.log(payoutModelData)
            let finalEwalletDeducted = payoutModelData?.afterChargeAmount

            let PayoutStoreData = {
                memberId: item?.memberId,
                amount: item?.amount,
                chargeAmount: item?.gatwayCharge || item?.afterChargeAmount - item?.amount,
                finalAmount: finalEwalletDeducted,
                bankRRN: data?.utr,
                trxId: data?.clientOrderId,
                optxId: data?.orderId,
                isSuccess: "Success",
            }

            let v = await payOutModel.create([PayoutStoreData], opts)
            console.log(v, "hello")
            await session.commitTransaction();
            return true;
        }
        else {
            console.log("Failed and Success Not Both !");
            await session.abortTransaction();
            return true;
        }
        // Commit transaction
        // await session.commitTransaction();
        // return true;

    } catch (error) {
        console.log("inside the error", error)
        await session.abortTransaction();
        return false
    } finally {
        session.endSession();
        release()
    }
}

function migrateData() {
    cron.schedule('0,30 * * * *', async () => {
        const release = await transactionMutex.acquire();
        try {
            console.log("Running cron job to migrate old data...");

            const threeHoursAgo = new Date();
            threeHoursAgo.setHours(threeHoursAgo.getHours() - 3)

            const oldData = await qrGenerationModel.find({ createdAt: { $lt: threeHoursAgo } }).sort({ createdAt: 1 }).limit(5000);

            if (oldData.length > 0) {
                const newData = oldData.map(item => ({
                    ...item,
                    memberId: new mongoose.Types.ObjectId((String(item?.memberId))),
                    name: String(item?.name),
                    amount: Number(item?.amount),
                    trxId: String(item?.trxId),
                    migratedAt: new Date(),
                }));

                await oldQrGenerationModel.insertMany(newData);

                const oldDataIds = oldData.map(item => item._id);
                await qrGenerationModel.deleteMany({ _id: { $in: oldDataIds } });

                console.log(`Successfully migrated ${oldData.length} records.`);
            } else {
                console.log("No data older than 1 day to migrate.");
            }
        } catch (error) {
            console.log("error=>", error.message);
        } finally {
            release()
        }
    }
    )
}

function logsClearFunc() {
    cron.schedule('* * */7 * *', async () => {
        let date = new Date();
        let DateComp = `${date.getFullYear()}-${(date.getMonth()) + 1}-${date.getDate() - 2}`
        await LogModel.deleteMany({ createdAt: { $lt: new Date(DateComp) } });
    });
}

// function payinScheduleTask() {
//     cron.schedule('*/10 * * * * *', async () => {
//         const release = await logsMutex.acquire()
//         try {
//             const logsToUpdate = await Log.aggregate([
//                 {
//                     $match: {
//                         "requestBody.status": 200,
//                         "responseBody": { $regex: "\"message\":\"Failed\"", $options: "i" }
//                     }
//                 },
//                 { $limit: 100 }
//             ]);

//             for (const log of logsToUpdate) {
//                 const trxId = log.requestBody.trxId;
//                 if (!trxId) continue;

//                 // Find QR Generation documents and update their callback status
//                 const qrDoc = await qrGenerationModel.findOneAndUpdate(
//                     { trxId, callBackStatus: "Pending" },
//                     { callBackStatus: "Success" }
//                 );

//                 if (!qrDoc) continue;

//                 // Prepare callback data from Log's requestBody
//                 let callBackData = log.requestBody;

//                 if (Object.keys(callBackData).length === 1) {
//                     const key = Object.keys(callBackData)[0];
//                     callBackData = JSON.parse(key);
//                 }

//                 const switchApi = callBackData.partnerTxnId
//                     ? "neyopayPayIn"
//                     : callBackData.txnID
//                         ? "marwarpayInSwitch"
//                         : null;

//                 if (!switchApi) continue;

//                 const data =
//                     switchApi === "neyopayPayIn"
//                         ? {
//                             status: callBackData?.txnstatus === "Success" ? 200 : 400,
//                             payerAmount: callBackData?.amount,
//                             payerName: callBackData?.payerName,
//                             txnID: callBackData?.partnerTxnId,
//                             BankRRN: callBackData?.rrn,
//                             payerVA: callBackData?.payerVA,
//                             TxnInitDate: callBackData?.TxnInitDate,
//                             TxnCompletionDate: callBackData?.TxnCompletionDate,
//                         }
//                         : {
//                             status: callBackData?.status,
//                             payerAmount: callBackData?.payerAmount,
//                             payerName: callBackData?.payerName,
//                             txnID: callBackData?.txnID,
//                             BankRRN: callBackData?.BankRRN,
//                             payerVA: callBackData?.payerVA,
//                             TxnInitDate: callBackData?.TxnInitDate,
//                             TxnCompletionDate: callBackData?.TxnCompletionDate,
//                         };

//                 if (data.status !== 200) continue;

//                 const userInfoPromise = userDB.aggregate([
//                     { $match: { _id: qrDoc.memberId } },
//                     { $lookup: { from: "packages", localField: "package", foreignField: "_id", as: "package" } },
//                     { $unwind: { path: "$package", preserveNullAndEmptyArrays: true } },
//                     { $lookup: { from: "payinpackages", localField: "package.packagePayInCharge", foreignField: "_id", as: "packageCharge" } },
//                     { $unwind: { path: "$packageCharge", preserveNullAndEmptyArrays: true } },
//                     { $project: { _id: 1, userName: 1, upiWalletBalance: 1, packageCharge: 1 } },
//                 ]);

//                 const callBackPayinUrlPromise = callBackResponseModel
//                     .find({ memberId: qrDoc.memberId, isActive: true })
//                     .select("_id payInCallBackUrl isActive");

//                 const [userInfoResult, callBackPayinUrlResult] = await Promise.allSettled([
//                     userInfoPromise,
//                     callBackPayinUrlPromise,
//                 ]);

//                 const userInfo = userInfoResult.value?.[0];
//                 const callBackPayinUrl = callBackPayinUrlResult.value?.[0]?.payInCallBackUrl;

//                 if (!userInfo || !callBackPayinUrl) continue;

//                 const chargeRange = userInfo.packageCharge?.payInChargeRange || [];
//                 const charge = chargeRange.find(
//                     (range) => range.lowerLimit <= data.payerAmount && range.upperLimit > data.payerAmount
//                 );

//                 const userChargeApply =
//                     charge.chargeType === "Flat"
//                         ? charge.charge
//                         : (charge.charge / 100) * data.payerAmount;
//                 const finalAmountAdd = data.payerAmount - userChargeApply;

//                 const [upiWalletUpdateResult, payInCreateResult] = await Promise.allSettled([
//                     userDB.findByIdAndUpdate(userInfo._id, {
//                         upiWalletBalance: userInfo.upiWalletBalance + finalAmountAdd,
//                     }),
//                     payInModel.create({
//                         memberId: qrDoc.memberId,
//                         payerName: data.payerName,
//                         trxId: data.txnID,
//                         amount: data.payerAmount,
//                         chargeAmount: userChargeApply,
//                         finalAmount: finalAmountAdd,
//                         vpaId: data.payerVA,
//                         bankRRN: data.BankRRN,
//                         description: `QR Generated Successfully Amount:${data.payerAmount} PayerVa:${data.payerVA} BankRRN:${data.BankRRN}`,
//                         trxCompletionDate: data.TxnCompletionDate,
//                         trxInItDate: data.TxnInitDate,
//                         isSuccess: data.status === 200 ? "Success" : "Failed",
//                     }),
//                 ]);

//                 if (
//                     upiWalletUpdateResult.status === "rejected" ||
//                     payInCreateResult.status === "rejected"
//                 ) {
//                     console.error("Error updating wallet or creating pay-in record");
//                     continue;
//                 }

//                 const userRespSendApi = {
//                     status: data.status,
//                     payerAmount: data.payerAmount,
//                     payerName: data.payerName,
//                     txnID: data.txnID,
//                     BankRRN: data.BankRRN,
//                     payerVA: data.payerVA,
//                     TxnInitDate: data.TxnInitDate,
//                     TxnCompletionDate: data.TxnCompletionDate,
//                 };

//                 await axios.post(callBackPayinUrl, userRespSendApi, {
//                     headers: {
//                         Accept: "application/json",
//                         "Content-Type": "application/json",
//                     },
//                 });
//             }
//         } catch (error) {

//         } finally {
//             release()
//         }
//     });
// }

function payinScheduleTask() {
    cron.schedule('0,30 * * * *', async () => {
        const release = await logsMutex.acquire()
        try {
            const startOfYesterday = moment().startOf('day').subtract(1, 'day').toDate();
            const endOfYesterday = moment().startOf('day').subtract(1, 'milliseconds').toDate();
            const endOfLastHalfHour = moment().toDate(); // Current time
            const startOfLastHalfHour = moment().subtract(30, 'minutes').toDate();
            const logs = await Log.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: startOfYesterday,
                            $lte: endOfYesterday,
                            // $gte: startOfLastHalfHour,
                            // $lte: endOfLastHalfHour,
                        },

                        "requestBody.status": 200,
                        // "requestBody.txnID": { $regex: "seabird74280342", $options: "i" },
                        // "requestBody.txnID": {
                        //     $in: [
                        //         "seabird74592153", "seabird74592045", "seabird74592191",
                        //         "seabird74592244"
                        //     ],
                        // },
                        "responseBody": { $regex: "\"message\":\"Failed\"", $options: "i" },
                        url: { $regex: "/apiAdmin/v1/payin/callBackResponse", $options: "i" },
                        description: { $nin: ["Log processed for payin and marked success"] }
                    },
                },
                { $sort: { createdAt: -1 } },
                { $limit: 10 }
            ]);

            if (!logs.length) return;

            for (const log of logs) {
                const loopRelease = await loopMutex.acquire()
                try {
                    const trxId = log.requestBody.txnID;
                    if (!trxId) throw new Error("Missing trxId in log");
                    let qrDoc
                    qrDoc = await qrGenerationModel.findOneAndUpdate(
                        { trxId },
                        // { trxId, callBackStatus: "Pending" },
                        { callBackStatus: "Success" }
                    )

                    if (!qrDoc) {
                        qrDoc = await oldQrGenerationModel.findOneAndUpdate(
                            { trxId },
                            // { trxId, callBackStatus: "Pending" },
                            { callBackStatus: "Success" }
                        );
                    }
                    console.log("qrDoc>>", qrDoc);

                    if (!qrDoc) throw new Error("QR Generation document not found or already processed");

                    let callBackData = log.requestBody;
                    if (Object.keys(callBackData).length === 1) {
                        const key = Object.keys(callBackData)[0];
                        callBackData = JSON.parse(key);
                    }

                    const switchApi = callBackData.partnerTxnId
                        ? "neyopayPayIn"
                        : callBackData.txnID
                            ? "marwarpayInSwitch"
                            : null;

                    if (!switchApi) throw new Error("Invalid transaction data in log");

                    const data = switchApi === "neyopayPayIn"
                        ? {
                            status: callBackData?.txnstatus === "Success" ? 200 : 400,
                            payerAmount: callBackData?.amount,
                            payerName: callBackData?.payerName,
                            txnID: callBackData?.partnerTxnId,
                            BankRRN: callBackData?.rrn,
                            payerVA: callBackData?.payerVA,
                            TxnInitDate: callBackData?.TxnInitDate,
                            TxnCompletionDate: callBackData?.TxnCompletionDate,
                        }
                        : {
                            status: callBackData?.status,
                            payerAmount: callBackData?.payerAmount,
                            payerName: callBackData?.payerName,
                            txnID: callBackData?.txnID,
                            BankRRN: callBackData?.BankRRN,
                            payerVA: callBackData?.payerVA,
                            TxnInitDate: callBackData?.TxnInitDate,
                            TxnCompletionDate: callBackData?.TxnCompletionDate,
                        };

                    if (data.status !== 200) throw new Error("Transaction is pending or not successful");

                    const [userInfo] = await userDB.aggregate([
                        { $match: { _id: qrDoc.memberId } },
                        { $lookup: { from: "packages", localField: "package", foreignField: "_id", as: "package" } },
                        { $unwind: { path: "$package", preserveNullAndEmptyArrays: true } },
                        { $lookup: { from: "payinpackages", localField: "package.packagePayInCharge", foreignField: "_id", as: "packageCharge" } },
                        { $unwind: { path: "$packageCharge", preserveNullAndEmptyArrays: true } },
                        { $project: { _id: 1, userName: 1, upiWalletBalance: 1, packageCharge: 1 } },
                    ])
                    const callBackPayinUrl = await callBackResponseModel.findOne({ memberId: qrDoc.memberId, isActive: true }).select("payInCallBackUrl")


                    if (!callBackPayinUrl) throw new Error("Callback URL is missing");


                    if (!userInfo) throw new Error("User info missing");

                    const chargeRange = userInfo.packageCharge?.payInChargeRange || [];
                    const charge = chargeRange.find(
                        (range) => range.lowerLimit <= data.payerAmount && range.upperLimit > data.payerAmount
                    );

                    if (!charge) return;

                    const userChargeApply =
                        charge.chargeType === "Flat"
                            ? charge.charge
                            : (charge.charge / 100) * data.payerAmount;
                    const finalAmountAdd = data.payerAmount - userChargeApply;

                    const tempPayin = await payInModel.findOne({ trxId: qrDoc?.trxId })

                    if (tempPayin) {
                        await Log.findByIdAndUpdate(log._id, {
                            $push: { description: "Log processed for payin and marked success" },
                        });
                        throw new Error("Trasaction already created");
                    }
                    const upiWalletDataObject = {
                        memberId: userInfo?._id,
                        transactionType: "Cr.",
                        transactionAmount: finalAmountAdd,
                        beforeAmount: userInfo?.upiWalletBalance,
                        afterAmount: Number(userInfo?.upiWalletBalance) + Number(finalAmountAdd),
                        description: `Successfully Cr. amount: ${finalAmountAdd}  trxId: ${data.txnID}`,
                        transactionStatus: "Success"
                    }

                    await upiWalletModel.create(upiWalletDataObject);
                    const upiWalletUpdateResult = await userDB.findByIdAndUpdate(userInfo._id, {
                        $inc: { upiWalletBalance: finalAmountAdd },
                    })

                    const payInCreateResult = await payInModel.create({
                        memberId: qrDoc.memberId,
                        payerName: data.payerName,
                        trxId: data.txnID,
                        amount: data.payerAmount,
                        chargeAmount: userChargeApply,
                        finalAmount: finalAmountAdd,
                        vpaId: data.payerVA,
                        bankRRN: data.BankRRN,
                        description: `QR Generated Successfully Amount:${data.payerAmount} PayerVa:${data.payerVA} BankRRN:${data.BankRRN}`,
                        trxCompletionDate: data.TxnCompletionDate,
                        trxInItDate: data.TxnInitDate,
                        isSuccess: "Success",
                    })

                    if (!upiWalletUpdateResult || !payInCreateResult) {
                        throw new Error("Error updating wallet or creating pay-in record");
                    }

                    const userRespSendApi = {
                        status: data.status,
                        payerAmount: data.payerAmount,
                        payerName: data.payerName,
                        txnID: data.txnID,
                        BankRRN: data.BankRRN,
                        payerVA: data.payerVA,
                        TxnInitDate: data.TxnInitDate,
                        TxnCompletionDate: data.TxnCompletionDate,
                    };
                    console.log("callBackPayinUrl.payInCallBackUrl>>>", callBackPayinUrl.payInCallBackUrl, userRespSendApi);



                    await axios.post(callBackPayinUrl.payInCallBackUrl, userRespSendApi, {
                        headers: {
                            Accept: "application/json",
                            "Content-Type": "application/json",
                        },
                    });

                    await Log.findByIdAndUpdate(log._id, {
                        $push: { description: "Log processed for payin and marked success" },
                    });

                } catch (error) {
                    console.error(`Error processing log with trxId ${log.requestBody.txnID}:`, error.message);
                } finally {
                    loopRelease()
                }
            }

        } catch (error) {
            console.log("Error in payin schedule task:", error.message);
        } finally {
            release()
        }
    });
}

function payoutTaskScript() {
    cron.schedule('*/10 * * * * *', async () => {
        console.log('Cron job started:', new Date());

        try {
            // Define the time range for the last day
            const startOfLastDay = moment().subtract(1, 'day').startOf('day').toDate();
            const endOfLastDay = moment().subtract(1, 'day').endOf('day').toDate();

            const logs = await Log.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: startOfLastDay,
                            $lte: new Date()
                        },
                        responseBody: { $regex: '"status":1', $options: 'i' }
                    }
                },
                {
                    $project: {
                        trxId: '$requestBody.trxId'
                    }
                }
            ]);

            if (!logs.length) {
                console.log('No matching logs found for the last day.');
                return;
            }

            const trxIds = logs.map(log => log.trxId);

            const regexPatterns = trxIds.map(trxId => new RegExp(trxId, 'i'));

            let updatedArrayOfEwallet = [];

            for (const txnId of trxIds) {
                const [updateResult] = await EwalletModel.find(
                    {
                        description: { $regex: txnId, $options: "i" },
                        transactionType: { $regex: 'Cr.', $options: "i" },
                    }
                );

                if (updateResult) {
                    try {
                        updatedArrayOfEwallet.push(updateResult)
                        const { transactionAmount, chargeAmount, memberId } = updateResult
                        const user = await userDB.findById(memberId)
                        const finalAmountDeduct = 2 * (Number(transactionAmount) + Number(chargeAmount))
                        user.EwalletBalance -= finalAmountDeduct;
                        await user.save()
                        const ewalletDoc = await EwalletModel.create({
                            memberId,
                            transactionType: "Dr.",
                            transactionAmount: transactionAmount,
                            beforeAmount: user.EwalletBalance,
                            chargeAmount: chargeAmount,
                            afterAmount: Number(user.EwalletBalance) - Number(finalAmountDeduct),
                            description: `Successfully Dr. amount: ${finalAmountDeduct} with transaction Id: ${txnId}`,
                            transactionStatus: "Success",
                        })

                        if (ewalletDoc) await updateResult.deleteOne({ _id: updateResult?._id })
                    } catch (error) {
                        console.log("error.message>>>", error.message);
                        break
                    }

                }
            }


            console.log(`Total modified documents in eWallets: ${updatedArrayOfEwallet.length}`);
        } catch (error) {
            console.error('Error in cron job:', error.message);
        } finally {
            console.log('Cron job completed:', new Date());
        }
    });
}

export default function scheduleTask() {
    scheduleWayuPayOutCheck()
    logsClearFunc()
    // migrateData()
    // payinScheduleTask()
    // payoutTaskScript()
}