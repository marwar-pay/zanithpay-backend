import userDB from "../../models/user.model.js";
import packageModel from "../../models/package.model.js";
import apiPayInModel from "../../models/apiPayInSwitch.model.js";
import apiPayOutModel from "../../models/apiPayOutSwitch.model.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const getUserList = asyncHandler(async (req, res) => {
    let userInfo = await userDB.aggregate([{ $match: { memberType: "Users" } }, {
        $project: { "_id": 1, "memberId": 1, "fullName": 1 }
    }, { $sort: { createdAt: -1 } }])
    if (!userInfo.length) {
        return res.status(400).json({ message: "Failed", data: "Not Active User Avabile !" })
    }
    res.status(200).json(new ApiResponse(200, userInfo))
})

export const getUserListWithUpiWallet = asyncHandler(async (req, res) => {
    let userInfo = await userDB.aggregate([{ $match: { memberType: "Users" } }, {
        $project: { "_id": 1, "memberId": 1, "fullName": 1, "upiWalletBalance": 1 }
    }, { $sort: { createdAt: -1 } }])
    if (!userInfo.length) {
        return res.status(400).json({ message: "Failed", data: "Not Active User Avabile !" })
    }
    res.status(200).json(new ApiResponse(200, userInfo))
})

export const getPackageList = asyncHandler(async (req, res) => {
    let packageData = await packageModel.aggregate([{ $match: { isActive: true } }, {
        $project: { "_id": 1, "packageName": 1 }
    }, { $sort: { createdAt: -1 } }])
    res.status(200).json(new ApiResponse(200, packageData))
})

export const getPayOutApiList = asyncHandler(async (req, res) => {
    let apiPayOut = await apiPayOutModel.aggregate([{ $match: { isActive: true } }, {
        $project: { "_id": 1, "apiName": 1 }
    }, { $sort: { createdAt: -1 } }])

    if (!apiPayOut.length) {
        return res.status(400).json({ message: "Failed", data: "Not Payout Api Found !" })
    }
    res.status(200).json(new ApiResponse(200, apiPayOut))
})

export const getPayInApiList = asyncHandler(async (req, res) => {
    let apiPayIn = await apiPayInModel.aggregate([{ $match: { isActive: true } }, {
        $project: { "_id": 1, "apiName": 1 }
    }, { $sort: { createdAt: -1 } }])

    if (!apiPayIn.length) {
        return res.status(400).json({ message: "Failed", data: "Not Payin Api Found !" })
    }
    res.status(200).json(new ApiResponse(200, apiPayIn))
})