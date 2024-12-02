import ipWhitelistModel from "../../models/ipWhiteList.model.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const getUserIp = asyncHandler(async (req, res) => {
    let allIpList = await ipWhitelistModel.find();
    res.status(200).json(new ApiResponse(200, allIpList))
})

export const getSingleUserIp = asyncHandler(async (req, res) => {
    let id = req.params.id;
    let pack = await ipWhitelistModel.findById(id);
    if (!pack) {
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