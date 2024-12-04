import cron from "node-cron";
import axios from "axios";
import payOutModelGenerate from "../models/payOutGenerate.model.js";
import userDB from "../models/user.model.js";
import walletModel from "../models/Ewallet.model.js";
import payOutModel from "../models/payOutSuccess.model.js";

export default function scheduleTask() {
    cron.schedule('*/30 * * * *', async () => {
        let GetData = await payOutModelGenerate.find({ isSuccess: "Pending" }).limit(100);

        if (GetData.length !== 0) {
            GetData.forEach((item) => {
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

                axios.post(uatUrl, postAdd, header).then(async (data) => {
                    if (data?.data?.status !== 1) {
                        await payOutModelGenerate.findByIdAndUpdate(item._id, { isSuccess: "Failed" })
                    }

                    else if (data?.data?.status === 1) {
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
                    }

                }).catch((err) => {
                    console.log(err.message)
                })
            })
        }
    });
}