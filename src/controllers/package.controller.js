import packageModel from "../models/package.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getPackage = asyncHandler(async (req, res) => {
    let pack = await packageModel.find();
    res.status(200).json({
        message: "Sucess",
        data: pack
    })
})

export const addPackage = asyncHandler(async (req, res) => {
    let pack = await packageModel.create(req.body);
    res.status(200).json({
        message: "Sucess",
        data: pack
    })
})

export const updatePackage = asyncHandler(async (req, res) => {
    let query = req.params.id;
    let queryFind = await packageModel.findById(query)
    if (!queryFind) {
        res.status(404).json({ message: "Faild" })
    }
    let update = await packageModel.findByIdAndUpdate(query, { ...req.body })
    res.status(200).json({ message: "Sucess", data: update })
})

export const deletePackage = asyncHandler(async (req, res) => {
        let query = req.params.id;
        let quaryFind = await packageModel.findByIdAndDelete(query)
        if (!quaryFind) {
            res.status(404).json({ message: "Faild", data: "Package not found !" })
        }
        res.status(200).json({
            message: "Sucess",
            data: quaryFind
        })
})