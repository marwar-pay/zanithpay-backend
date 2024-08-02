import axios from "axios";
import qrGenerationModel from "../models/qrGeneration.model.js";

export const allGeneratedPayment = async (req, res) => {
    try {
        let payment = await qrGenerationModel.find().then((result) => {
            res.status(200).json({ message: "Success", result })
        })
    } catch (error) {
        res.status(400).json({ success: false, message: "some issue", error: error.message })
    }
    let pack = await qrGenerationModel.find();
    res.status(200).json({
        message: "Sucess",
        pack
    })
}

export const generatePayment = async (req, res) => {
    try {
        let payment = await qrGenerationModel.create(req.body).then(async (data) => {
            // calling banking API SuccessFully Generated Data QR
            let bank = await axios.get("https://jsonplaceholder.typicode.com/todos/1")
            console.log(bank.data, "bank response");

            let QrData = data.qrData = bank.data.title;
            await data.save();
            // Send response
            res.status(200).json({
                message: "Sucess inside",
                data: {
                    status_msg: "QR Generated Successfully",
                    status: "Success",
                    qr:data.qrData,
                    trxID:data.trxID
                }
            })
        })
    } catch (error) {
        res.status(400).json({ success: false, message: "some issue", error: error.message })
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