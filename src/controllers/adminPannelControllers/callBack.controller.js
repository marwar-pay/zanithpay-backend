import callBackModel from "../../models/callBackResponse.model.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const getAllCallBackUrl = asyncHandler(async (req, res) => {
    let pack = await callBackModel.find();
    res.status(200).json(new ApiResponse(200,pack))
})

export const getCallBackUrl = asyncHandler(async (req, res) => {
    let id = req.params.id;
    let pack = await callBackModel.findById(id);
    if(!pack){
        return res.status(400).json({message: "Failed",data: "Not Found !"})
    }
    res.status(200).json(new ApiResponse(200,pack))
})

export const addCallBackUrl = asyncHandler(async (req, res) => {
    let pack = await callBackModel.create(req.body);
    res.status(200).json(new ApiResponse(200,pack))
})

export const updateCallBackUrl = asyncHandler(async (req, res) => {
    let query = req.params.id;
    let update = await callBackModel.findByIdAndUpdate(query, { ...req.body })
    if (!update) {
        return res.status(404).json({ message: "Failed", data: "Docoment Not Found !" })
    }
    res.status(200).json(new ApiResponse(200,update))
})

export const deleteCallBackUrl = asyncHandler(async (req, res) => {
    let query = req.params.id;
    let quaryFind = await callBackModel.findByIdAndDelete(query)
    if (!quaryFind) {
       return res.status(404).json({ message: "Failed", data: "Docoment not found !" })
    }
    res.status(200).json(new ApiResponse(200,quaryFind))
})