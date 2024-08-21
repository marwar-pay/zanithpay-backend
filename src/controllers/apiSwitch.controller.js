import apiPayInModel from "../models/apiPayInSwitch.model.js";
import apiPayOutModel from "../models/apiPayOutSwitch.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getAllApiPayIn = asyncHandler(async (req, res) => {
    let pack = await apiPayInModel.find();
    res.status(200).json({
        message: "Sucess",
        data: pack
    })
})

export const addApiPayIn = asyncHandler(async (req, res) => {
    let pack = await apiPayInModel.create(req.body);
    res.status(200).json({
        message: "Sucess",
        data: pack
    })
})

export const updateApiPayIn = asyncHandler(async (req, res) => {
    let query = req.params.id;
    let queryFind = await apiPayInModel.findById(query)
    if (!queryFind) {
        res.status(404).json({ message: "Faild" })
    }
    let update = await apiPayInModel.findByIdAndUpdate(query, { ...req.body })
    res.status(200).json({ message: "Sucess", data: update })
})

export const deleteApiPayIn = asyncHandler(async (req, res) => {
    let query = req.params.id;
    let quaryFind = await apiPayInModel.findByIdAndDelete(query)
    if (!quaryFind) {
        res.status(404).json({ message: "Faild", data: "Package not found !" })
    }
    res.status(200).json({
        message: "Sucess",
        data: quaryFind
    })
})

export const getAllApiPayOut = asyncHandler(async (req, res) => {
    let pack = await apiPayOutModel.find();
    res.status(200).json({
        message: "Sucess",
        data: pack
    })
})

export const addApiPayOut = asyncHandler(async (req, res) => {
    let pack = await apiPayOutModel.create(req.body);
    res.status(200).json({
        message: "Sucess",
        data: pack
    })
})

export const updateApiPayOut = asyncHandler(async (req, res) => {
    let query = req.params.id;
    // let queryFind = await apiPayOutModel.findById(query)
    let update = await apiPayOutModel.findByIdAndUpdate(query, { ...req.body })
    if (!update) {
        return res.status(404).json({ message: "Failed" })
    }
    res.status(200).json({ message: "Sucess", data: update })
})

export const deleteApiPayOut = asyncHandler(async (req, res) => {
    let query = req.params.id;
    let quaryFind = await apiPayOutModel.findByIdAndDelete(query)
    if (!quaryFind) {
        res.status(404).json({ message: "Faild", data: "Package not found !" })
    }
    res.status(200).json({
        message: "Sucess",
        data: quaryFind
    })
})