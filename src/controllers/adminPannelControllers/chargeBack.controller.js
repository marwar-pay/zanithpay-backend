import payInModel from "../../models/payIn.model.js";
import chargeBackModel from "../../models/chargeBack.model.js";
import eWalletModel from "../../models/Ewallet.model.js";
import userDB from "../../models/user.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

export const getAllChargeBack = asyncHandler(async (req, res) => {
    let getchargeBack = await chargeBackModel.aggregate([{
        $lookup: {
            from: "users",
            localField: "memberId",
            foreignField: "_id",
            pipeline: [
                { $project: { userName: 1, fullName: 1, memberId: 1, _id: 1 } }
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
            "vpaId": 1,
            "bankRRN": 1,
            "description": 1,
            "isSuccess": 1,
            "createdAt": 1,
            "userInfo.userName": 1,
            "userInfo.fullName": 1,
            "userInfo.memberId": 1
        }
    }]).allowDiskUse(true);

    if (getchargeBack.length === 0) {
        return res.status(400).json({ message: "Failed", data: "No Charge Back Found !" })
    }

    res.status(200).json({ message: "Success", data: getchargeBack })
});

export const generateChargeBack = asyncHandler(async (req, res) => {
    const { trxId } = req.body;
    let payinDataGet = await payInModel.findOne({ trxId: trxId });

    if (!payinDataGet) {
        return res.status(400).json({ message: "Failed", data: "Trx Not Found !" })
    }

    const session = await userDB.startSession({ readPreference: 'primary', readConcern: { level: "majority" }, writeConcern: { w: "majority" } });
    try {
        session.startTransaction();
        const opts = { session };

        let ChargeBackStore = {
            memberId: payinDataGet?.memberId,
            payerName: payinDataGet?.payerName,
            trxId: payinDataGet?.trxId,
            amount: payinDataGet?.amount,
            vpaId: payinDataGet?.vpaId,
            bankRRN: payinDataGet?.bankRRN,
            description: `#Chargeback amount : ${payinDataGet?.amount} Generated with trx Id : ${payinDataGet?.trxId} !`,
            isSuccess: payinDataGet?.isSuccess,
        }

        // ewallet deducted
        let userEwallet = await userDB.findById(payinDataGet?.memberId, "_id EwalletBalance", { session })
        let beforeAmount = userEwallet?.EwalletBalance;
        let afterAmount = beforeAmount - payinDataGet?.amount
        userEwallet.EwalletBalance -= payinDataGet?.amount;
        await userEwallet.save(opts)

        let eWalletStore = {
            memberId: payinDataGet?.memberId,
            transactionType: "Dr.",
            transactionAmount: payinDataGet?.amount,
            beforeAmount: beforeAmount,
            chargeAmount: 0,
            afterAmount: afterAmount,
            description: `#Chargeback amount : ${payinDataGet?.amount} Generated with trx Id : ${payinDataGet?.trxId} !`,
            transactionStatus: payinDataGet?.isSuccess,
        }

        await chargeBackModel.create([ChargeBackStore], { session });
        await eWalletModel.create([eWalletStore], { session });
        await session.commitTransaction();
        res.status(200).json(new ApiResponse(200, "ChargeBack Generated Successfully !"));
    } catch (error) {
        await session.abortTransaction();
        if (error?.code === 11000) {
            return res.status(400).json({ message: "Failed", data: "ChargeBack Already done " })
        }
        return res.status(500).json({ message: "Failed", data: "Internel Server Error" })
    } finally {
        session.endSession();
    }
});