import cron from "node-cron";
import axios from "axios";
import payOutModelGenerate from "../models/payOutGenerate.model.js";


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
                        let update = await payOutModelGenerate.findByIdAndUpdate(item._id, { isSuccess: "Failed" }, { new: true })
                        // console.log(data.data.status)
                        // console.log(update)
                    }

                    if (data?.data?.status === 1) {
                        let callURl = "http://localhost:5000/apiAdmin/v1/payout/payoutCallBackResponse";
                        let customData = {
                            StatusCode: data?.data?.statusCode,
                            Message: data?.data?.message,
                            OrderId: data?.data?.orderId,
                            Status: data?.data?.status,
                            ClientOrderId: data?.data?.clientOrderId,
                            PaymentMode: "IMPS",
                            Amount: data?.data?.amount,
                            Date: new Date().toString(),
                            UTR: data?.data?.utr,
                        }

                        let optionsSend = {
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': "application/json"
                            }
                        };
                        axios.post(callURl, customData, optionsSend).then((resu) => {
                            console.log(resu?.data)
                        }).catch((err) => {
                            console.log(err.message)
                        })
                    }
                    // GetData.isSuccess = 
                }).catch((err) => {
                    console.log(err.message)
                })
            })
        }
    });
}