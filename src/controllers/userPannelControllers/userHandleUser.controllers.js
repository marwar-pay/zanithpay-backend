import { ApiResponse } from "../../utils/ApiResponse.js"
import userDB from "../../models/user.model.js"
import { asyncHandler } from "../../utils/asyncHandler.js"
import { ApiError } from "../../utils/ApiError.js"

export const userInfo = asyncHandler(async (req, res) => {
    let user = await userDB.aggregate([{ $lookup: { from: "packages", localField: "package", foreignField: "_id", as: "package" } }, {
        $unwind: {
            path: "$package",
            preserveNullAndEmptyArrays: true,
        },
    }]).then((data) => {
        res.status(200).json(new ApiResponse(200, data))
    })
})

export const changePassword = asyncHandler(async (req, res) => {
    let user = await userDB.aggregate([{ $lookup: { from: "packages", localField: "package", foreignField: "_id", as: "package" } }, {
        $unwind: {
            path: "$package",
            preserveNullAndEmptyArrays: true,
        },
    }]).then((data) => {
        res.status(200).json(new ApiResponse(200, data))
    })
})

export const updateProfile = asyncHandler(async (req, res) => {
    let user = await userDB.aggregate([{ $lookup: { from: "packages", localField: "package", foreignField: "_id", as: "package" } }, {
        $unwind: {
            path: "$package",
            preserveNullAndEmptyArrays: true,
        },
    }]).then((data) => {
        res.status(200).json(new ApiResponse(200, data))
    })
})