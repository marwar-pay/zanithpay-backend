import { ApiResponse } from "../../utils/ApiResponse.js"
import QrGenerationModel from "../../models/qrGeneration.model.js"
import payInModelSuccess from "../../models/payIn.model.js"
import { asyncHandler } from "../../utils/asyncHandler.js"
import { ApiError } from "../../utils/ApiError.js"

export const allPayInTransactionGeneration = asyncHandler(async (req, res) => {
    let userId = req.user._id
    let user = await QrGenerationModel.aggregate([{ $match: { $expr: { memberId: userId } } }, { $lookup: { from: "users", localField: "memberId", foreignField: "_id", as: "userInfo" } }, {
        $unwind: {
            path: "$userInfo",
            preserveNullAndEmptyArrays: true,
        },
    }, { $project: { "_id": 1, "memberId": 1, "trxId": 1, "amount": 1, "name": 1, "callBackStatus": 1, "createdAt": 1, "updatedAt": 1, "userInfo._id": 1, "userInfo.memberId": 1 } }, { $sort: { createdAt: -1 } }]).then((data) => {
        if (data.length === 0) {
            return res.status(200).json({ message: "Failed", data: "No Trx Avabile !" })
        }
        res.status(200).json(new ApiResponse(200, data))
    }).catch((error) => {
        res.status(500).json({ message: "Failed", data: "Some Inter Server Error!" })
    })
})

export const allPayInTransactionSuccess = asyncHandler(async (req, res) => {
    let userId = req.user._id;
    let user = await payInModelSuccess.aggregate([{ $match: { $expr: { memberId: userId } } }, { $lookup: { from: "users", localField: "memberId", foreignField: "_id", as: "userInfo" } }, {
        $unwind: {
            path: "$userInfo",
            preserveNullAndEmptyArrays: true,
        },
    }, { $project: { "_id": 1, "memberId": 1, "payerName": 1, "trxId": 1, "amount": 1, "chargeAmount": 1, "finalAmount": 1, "vpaId": 1, "bankRRN": 1, "isSuccess": 1, "createdAt": 1, "updatedAt": 1, "userInfo._id": 1, "userInfo.memberId": 1 } }, { $sort: { createdAt: -1 } }]).then((data) => {
        if (data.length === 0) {
            return res.status(200).json({ message: "Failed", data: "No Trx Avabile !" })
        }
        res.status(200).json(new ApiResponse(200, data,))
    }).catch((error) => {
        res.status(500).json({ message: "Failed", data: "Some Inter Server Error!" })
    })
})