import apiPayInModel from "../../models/apiPayInSwitch.model.js";
import apiPayOutModel from "../../models/apiPayOutSwitch.model.js";
import userDB from "../../models/user.model.js"
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const getAllApiPayIn = asyncHandler(async (req, res) => {
    let pack = await apiPayInModel.find();
    res.status(200).json(new ApiResponse(200, pack))
})

export const addApiPayIn = asyncHandler(async (req, res) => {
    let pack = await apiPayInModel.create(req.body);
    res.status(200).json(new ApiResponse(200, pack))
})

export const updateApiPayIn = asyncHandler(async (req, res) => {
    let query = req.params.id;
    let queryFind = await apiPayInModel.findById(query)
    if (!queryFind) {
        res.status(404).json({ message: "Faild" })
    }
    let update = await apiPayInModel.findByIdAndUpdate(query, { ...req.body })
    res.status(200).json(new ApiResponse(200, update))
})

export const deleteApiPayIn = asyncHandler(async (req, res) => {
    let query = req.params.id;
    let quaryFind = await apiPayInModel.findByIdAndDelete(query)
    if (!quaryFind) {
        res.status(404).json({ message: "Faild", data: "Package not found !" })
    }
    res.status(200).json(new ApiResponse(200, quaryFind))
})

export const getAllApiPayOut = asyncHandler(async (req, res) => {
    let pack = await apiPayOutModel.find();
    res.status(200).json(new ApiResponse(200, pack))
})

export const addApiPayOut = asyncHandler(async (req, res) => {
    let pack = await apiPayOutModel.create(req.body);
    res.status(200).json(new ApiResponse(200, pack))
})

export const updateApiPayOut = asyncHandler(async (req, res) => {
    let query = req.params.id;
    // let queryFind = await apiPayOutModel.findById(query)
    let update = await apiPayOutModel.findByIdAndUpdate(query, { ...req.body })
    if (!update) {
        return res.status(404).json({ message: "Failed" })
    }
    res.status(200).json(new ApiResponse(200, update))
})

export const deleteApiPayOut = asyncHandler(async (req, res) => {
    let query = req.params.id;
    let quaryFind = await apiPayOutModel.findByIdAndDelete(query)
    if (!quaryFind) {
        res.status(404).json({ message: "Faild", data: "Package not found !" })
    }
    res.status(200).json(new ApiResponse(200, quaryFind))
})

export const AllUserSwitchPayIn = asyncHandler(async (req, res) => {
    let query = req.body.apiId;
    let ApiQueryFind = await apiPayInModel.findById(query)
    if (!ApiQueryFind) {
        return res.status(400).json({ message: "Failed", data: "Please check Api Not Available !" })
    }
    let userUpdate = await userDB.updateMany({ memberType: "Users" }, { payInApi: query })
    res.status(200).json(new ApiResponse(200, userUpdate))
})

export const AllUserSwitchPayOut = asyncHandler(async (req, res) => {
    let query = req.body.apiId;
    let ApiQueryFind = await apiPayOutModel.findById(query)
    if (!ApiQueryFind) {
        return res.status(400).json({ message: "Failed", data: "Please check Api Not Available !" })
    }
    let userUpdate = await userDB.updateMany({ memberType: "Users" }, { payOutApi: query })
    res.status(200).json(new ApiResponse(200, userUpdate))
})

export const OneUserSwitchPayIn = asyncHandler(async (req, res) => {
    let query = req.body.apiId;
    let userId = req.body.userId
    let ApiQueryFind = await apiPayInModel.findById(query)
    if (!ApiQueryFind) {
        return res.status(400).json({ message: "Failed", data: "Please check Api Not Available !" })
    }
    let userUpdate = await userDB.findByIdAndUpdate(userId, { payInApi: query })
    if (!userUpdate) {
        return res.status(400).json({ message: "Failed", data: "Please check credentials !" })
    }
    res.status(200).json(new ApiResponse(200, "Switch SuccessFully"))
})

export const OneUserSwitchPayOut = asyncHandler(async (req, res) => {
    let query = req.body.apiId;
    let userId = req.body.userId
    let ApiQueryFind = await apiPayOutModel.findById(query)
    if (!ApiQueryFind) {
        return res.status(400).json({ message: "Failed", data: "Please check Api Not Available !" })
    }
    let userUpdate = await userDB.findByIdAndUpdate(userId, { payOutApi: query })
    if (!userUpdate) {
        return res.status(400).json({ message: "Failed", data: "Please check credentials !" })
    }
    res.status(200).json(new ApiResponse(200, "Switch SuccessFully"))
})