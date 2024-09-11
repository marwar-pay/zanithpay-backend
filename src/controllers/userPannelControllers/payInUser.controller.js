import { ApiResponse } from "../../utils/ApiResponse.js"
import QrGenerationModel from "../../models/qrGeneration.model.js"
import payInModelSuccess from "../../models/payIn.model.js"
import { asyncHandler } from "../../utils/asyncHandler.js"
import { ApiError } from "../../utils/ApiError.js"

export const allPayInTransactionGeneration = asyncHandler(async (req, res) => {
    let userId = "66c86b75986120a64a2946fa"
    let dd = await QrGenerationModel.find({memberId:userId})
    let user = await QrGenerationModel.aggregate([{ $lookup: { from: "users", localField: "memberId", foreignField: "_id", as: "userInfo" } }, {
        $unwind: {
            path: "$userInfo",
            preserveNullAndEmptyArrays: true,
        },
    }]).then((data) => {
        res.status(200).json(new ApiResponse(200, data,dd))
    })
})

export const allPayInTransactionSuccess = asyncHandler(async (req, res) => {
    let user = await payInModelSuccess.aggregate([{ $lookup: { from: "users", localField: "memberId", foreignField: "_id", as: "userInfo" } }, {
        $unwind: {
            path: "$userInfo",
            preserveNullAndEmptyArrays: true,
        },
    },{$project:{"_id":1,"memberId":1,"payerName":1,"trxId":1,"amount":1,"chargeAmount":1,"finalAmount":1,"vpaId":1,"bankRRN":1,"isSuccess":1,"userInfo._id":1,"userInfo.memberId":1}}]).then((data) => {
        res.status(200).json(new ApiResponse(200, data))
    })
})