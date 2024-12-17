import cron from "node-cron";
import axios from "axios";
import userDB from "../models/user.model.js";
import payOutModelGenerate from "../models/payOutGenerate.model.js";
import walletModel from "../models/Ewallet.model.js";
import payOutModel from "../models/payOutSuccess.model.js";
import LogModel from "../models/Logs.model.js";
import { Mutex } from "async-mutex";
const transactionMutex = new Mutex();

function scheduleWayuPayOutCheck() {
    cron.schedule('*/30 * * * *', async () => {
        const release = await transactionMutex.acquire();
        try {
            let GetData = await payOutModelGenerate.find({ isSuccess: "Pending" }).limit(500);
            if (GetData.length !== 0) {
                GetData.forEach(async (item) => {
                    let uatUrl = "https://api.waayupay.com/api/api/api-module/payout/status-check"
                    let postAdd = {
                        clientId: "adb25735-69c7-4411-a120-5f2e818bdae5",
                        secretKey: "6af59e5a-7f28-4670-99ae-826232b467be",
                        clientOrderId: item.trxId
                    }
                    let header = {
                        header: {
                            "Accept": "application/json",
                            "Content-Type": "application/json"
                        }
                    }

                    await axios.post(uatUrl, postAdd, header).then(async (data) => {
                        if (data?.data?.status !== 1) {
                            await payOutModelGenerate.findByIdAndUpdate(item._id, { isSuccess: "Failed" })
                        }

                        else if (data?.data?.status === 1) {
                            let userWalletInfo = await userDB.findById(item?.memberId, "_id EwalletBalance");
                            let beforeAmountUser = userWalletInfo.EwalletBalance;
                            let finalEwalletDeducted = item?.afterChargeAmount;
                            await payOutModelGenerate.findByIdAndUpdate(item._id, { isSuccess: "Success" })

                            let walletModelDataStore = {
                                memberId: userWalletInfo._id,
                                transactionType: "Dr.",
                                transactionAmount: item?.amount,
                                beforeAmount: beforeAmountUser,
                                chargeAmount: item?.gatwayCharge || item?.afterChargeAmount - item?.amount,
                                afterAmount: beforeAmountUser - finalEwalletDeducted,
                                description: `Successfully Dr. amount: ${finalEwalletDeducted}`,
                                transactionStatus: "Success",
                            }

                            // update the user wallet balance 
                            userWalletInfo.EwalletBalance -= finalEwalletDeducted
                            await userWalletInfo.save();

                            let storeTrx = await walletModel.create(walletModelDataStore)

                            let payoutDataStore = {
                                memberId: item?.memberId,
                                amount: item?.amount,
                                chargeAmount: item?.gatwayCharge || item?.afterChargeAmount - item?.amount,
                                finalAmount: finalEwalletDeducted,
                                bankRRN: data?.data?.utr,
                                trxId: data?.data?.clientOrderId,
                                optxId: data?.data?.orderId,
                                isSuccess: "Success"
                            }

                            await payOutModel.create(payoutDataStore)
                        }

                    }).catch((err) => {
                        console.log(err.message)
                    })
                })
            }
        } catch (error) {
            console.log(error)
        } finally {
            release()
        }
    });
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
}