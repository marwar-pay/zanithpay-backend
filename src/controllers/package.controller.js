import packageModel from "../models/package.model.js";

export const getPackage = async (req, res) => {
    let pack = await packageModel.find();
    res.status(200).json({
        message: "Sucess",
        pack
    })
}

export const addPackage = async (req, res) => {
    let pack = await packageModel.create(req.body);
    res.status(200).json({
        message: "Sucess",
        pack
    })
}