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
const transactionMutex = new Mutex();

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
    // cron.schedule('*/20 * * * * *', async () => {
    //     const release = await transactionMutex.acquire();
    //     try {
    //         const GetData = await payOutModelGenerate.find({ isSuccess: "Pending" }).limit(100);
    //         const idsToUpdate = GetData.map(item => item._id);

    //         if (idsToUpdate.length === 0) return;

    //         await payOutModelGenerate.updateMany(
    //             { _id: { $in: idsToUpdate } },
    //             { $set: { isSuccess: "Pending" } }
    //         );


    //         const batchSize = 100;
    //         for (let i = 0; i < GetData.length; i += batchSize) {
    //             const batch = GetData.slice(i, i + batchSize);

    //             batch.map(item => setTimeout(async () => {
    //                 await processPayoutItem(item)
    //             }, [2000]))

    //         }
    //     } catch (error) {
    //         console.error('Error during payout check:', error.message);
    //     } finally {
    //         release();
    //     }
    // });
}

async function processPayoutItem(item) {
    try {
        const uatUrl = "https://api.waayupay.com/api/api/api-module/payout/status-check";
        const postAdd = {
            clientId: "adb25735-69c7-4411-a120-5f2e818bdae5",
            secretKey: "6af59e5a-7f28-4670-99ae-826232b467be",
            clientOrderId: item.trxId,
        };
        const header = {
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
        };

        const { data } = await axios.post(uatUrl, postAdd, header);
        console.log("data>>", data);

        if (data?.status !== 1) {
            console.log("failed");
            await payOutModelGenerate.findByIdAndUpdate(item._id, { isSuccess: "Failed" });
        } else {
            console.log("success");

            let userWalletInfo = await userDB.findById(item?.memberId, "_id EwalletBalance");
            const beforeAmountUser = userWalletInfo.EwalletBalance;
            const finalEwalletDeducted = item?.afterChargeAmount;

            userWalletInfo.EwalletBalance -= finalEwalletDeducted;
            await userWalletInfo.save();

            const walletModelDataStore = {
                memberId: userWalletInfo._id,
                transactionType: "Dr.",
                transactionAmount: item?.amount,
                beforeAmount: beforeAmountUser,
                chargeAmount: item?.gatwayCharge || item?.afterChargeAmount - item?.amount,
                afterAmount: beforeAmountUser - finalEwalletDeducted,
                description: `Successfully Dr. amount: ${finalEwalletDeducted}`,
                transactionStatus: "Success",
            };
            await walletModel.create(walletModelDataStore);

            const payoutDataStore = {
                memberId: item?.memberId,
                amount: item?.amount,
                chargeAmount: item?.gatwayCharge || item?.afterChargeAmount - item?.amount,
                finalAmount: finalEwalletDeducted,
                bankRRN: data?.utr,
                trxId: data?.clientOrderId,
                optxId: data?.orderId,
                isSuccess: "Success",
            };
            await payOutModel.create(payoutDataStore);

            await payOutModelGenerate.findByIdAndUpdate(item._id, { isSuccess: "Success" });
        }
    } catch (error) {
        console.error(`Error processing trxId ${item.trxId}:`, error.message);
    }
}

function migrateData() {
    cron.schedule('*/20 * * * * *', async () => {
        const release = await transactionMutex.acquire();
        try {
            console.log("Running cron job to migrate old data...");

            const oneDayAgo = new Date();
            oneDayAgo.setDate(oneDayAgo.getDate() - 1);

            const oldData = await qrGenerationModel.find({ createdAt: { $lt: oneDayAgo } }).sort({createdAt:1}).limit(100);
            console.log("oldataaaa", oldData);
            
            if (oldData.length > 0) { 
                const newData = oldData.map(item => ({
                    ...item,
                    memberId:new mongoose.Types.ObjectId((String(item?.memberId))),
                    name: String(item?.name),
                    amount: Number(item?.amount),
                    trxId: String(item?.trxId),
                    migratedAt: new Date(),
                }));

                await oldQrGenerationModel.insertMany(newData);
 
                const oldDataIds = oldData.map(item => item._id);
                await OldTable.deleteMany({ _id: { $in: oldDataIds } });

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



export default function scheduleTask() {
    scheduleWayuPayOutCheck()
    logsClearFunc()
    // migrateData()
}