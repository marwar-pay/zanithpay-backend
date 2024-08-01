import qrGenerationModel from "../models/qrGeneration.model.js";

export const allGeneratedPayment = async (req, res) => {
    let pack = await qrGenerationModel.find();
    res.status(200).json({
        message: "Sucess",
        pack
    })
}

export const generatePayment = async (req, res) => {
    try {
        let payment = await qrGenerationModel.create(req.body);
        res.status(200).json({
            message: "Sucess",
            payment
        })
    } catch (error) {
        res.status(500).json({success:false,message:"some issue"})
    }

}

export const paymentStatusCheck = async (req, res) => {
    let pack = await qrGenerationModel.find();
    res.status(200).json({
        message: "Sucess",
        pack
    })
}

export const paymentStatusUpdate = async (req, res) => {
    let pack = await qrGenerationModel.find();
    res.status(200).json({
        message: "Sucess",
        pack
    })
}