import ipWhitelistModel from "../../models/ipWhiteList.model.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import mongoose from "mongoose";
const mongoDBObJ = mongoose.Types.ObjectId;

export const getUserIp = asyncHandler(async (req, res) => {
    let allIpList = await ipWhitelistModel.aggregate([{ $lookup: { from: "users", localField: "memberId", foreignField: "_id", as: "userInfo" } },
    {
        $unwind: {
            path: "$userInfo",
            preserveNullAndEmptyArrays: true,
        }
    }, {
        $project: { "_id": 1, "ipUser": 1, "ipUserDev": 1, "isStatus": 1, "createdAt": 1, "updatedAt": 1, "userInfo._id": 1, "userInfo.userName": 1, "userInfo.memberId": 1, "userInfo.fullName": 1 }
    }, { $sort: { createdAt: -1 } }
    ]);
    res.status(200).json(new ApiResponse(200, allIpList))
})

export const getSingleUserIp = asyncHandler(async (req, res) => {
    let id = req.params.id;
    let pack = await ipWhitelistModel.aggregate([{ $match: { _id: new mongoDBObJ(id) } }, { $lookup: { from: "users", localField: "memberId", foreignField: "_id", as: "userInfo" } },
    {
        $unwind: {
            path: "$userInfo",
            preserveNullAndEmptyArrays: true,
        }
    }, {
        $project: { "_id": 1, "ipUser": 1, "ipUserDev": 1, "isStatus": 1, "createdAt": 1, "updatedAt": 1, "userInfo._id": 1, "userInfo.userName": 1, "userInfo.memberId": 1, "userInfo.fullName": 1 }
    }]);
    if (pack.length === 0) {
        return res.status(400).json({ message: "Failed", data: "Not Found !" })
    }
    res.status(200).json(new ApiResponse(200, pack))
})

export const addUserIp = asyncHandler(async (req, res) => {
    let pack = await ipWhitelistModel.create(req.body);
    res.status(200).json(new ApiResponse(200, pack))
})

export const updateUserIp = asyncHandler(async (req, res) => {
    let query = req.params.id;
    let update = await ipWhitelistModel.findByIdAndUpdate(query, { ...req.body }, { new: true })
    if (!update) {
        return res.status(404).json({ message: "Failed", data: "Docoment Not Found !" })
    }
    res.status(200).json(new ApiResponse(200, update))
})

export const deleteUserIp = asyncHandler(async (req, res) => {
    let query = req.params.id;
    let quaryFind = await ipWhitelistModel.findByIdAndDelete(query)
    if (!quaryFind) {
        return res.status(404).json({ message: "Failed", data: "Docoment not found !" })
    }
    res.status(200).json(new ApiResponse(200, quaryFind))
})