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

export const updatePackage = async (req, res) => {
    let query = req.params.id;
    let queryFind = await packageModel.findById(query)
    if (!queryFind) {
        res.status(404).json({ message: "Faild" })
    }
    let update = await packageModel.findByIdAndUpdate(query, { ...req.body })
    res.status(200).json({ message: "Sucess", data: "update success", update })
}

export const deletePackage = async (req, res) => {
    let query = req.params.id;
    let quaryFind = await packageModel.findByIdAndDelete(query).catch((error) => { res.json({ message: "Faild", data: error.message }) })
    if (!quaryFind) {
        res.status(404).json({ message: "Faild", data: "Package not found !" })
    }
    res.status(200).json({
        message: "Sucess",
        quaryFind
    })
}