import userDB from "../models/user.model.js"
import JWT from "jsonwebtoken"
import bcrypt from "bcrypt"

export const getUser = async (req, res) => {
    try {
        let user = await userDB.aggregate([{ $lookup: { from: "packages", localField: "package", foreignField: "_id", as: "package" } }, {
            $unwind: {
                path: "$package",
                preserveNullAndEmptyArrays: true,
            },
        }]).then((data) => {
            res.status(200).json({
                message: "Sucess",
                data
            })
        })
    } catch (error) {
        res.status(400).json({ success: false, message: "some issue", error: error.message })
    }

}

export const getSingleUser = async (req, res) => {
    try {
        let data = req.params.id
        let user = await userDB.findById(data);
        if (!user) {
            return res.status(400).json({ message: "Failed", data: "User Not Avabile" })
        }
        res.status(200).json({ message: "Success", data: user })
    } catch (error) {
        res.status(400).json({ success: false, message: "some issue", error: error.message })
    }

}

export const addUser = async (req, res) => {
    try {
        let user = await userDB.create(req.body).then((data) => {
            res.status(200).json({
                message: "Sucess",
                data
            })
        })
    } catch (error) {
        res.status(400).json({ success: false, message: "some issue", error: error.message })
    }
}

export const updateUser = async (req, res) => {
    try {
        let id = req.params.id
        let user = await userDB.findByIdAndUpdate(id, req.body).then((data) => {
            res.status(200).json({
                message: "Sucess",
                data
            })
        })
    } catch (error) {
        res.status(400).json({ success: false, message: "some issue", error: error.message })
    }
}

export const loginUser = async (req, res) => {
    try {
        // let user = await userDB.create(req.body)
        res.cookie("accessToken", "dshfdshfdfdfjdslkfjdkfdads", { httpOnly: true, secure: true }).status(200).json({
            message: "Sucess",
            data: "success"
        })
    } catch (error) {
        res.status(400).json({ success: false, message: "some issue", error: error.message })
    }

}

export const registerUser = async (req, res) => {
    try {
        bcrypt.hash(myPlaintextPassword, process.env.SALTROUND_BCRYPT, function (err, hash) {
            if (err) {
                res.status(400).json({ success: false, message: "some issue", error: err.message })
            }

        });
        let user = await userDB.create(req.body).then((data) => {
            res.status(200).json({
                message: "Sucess",
                data
            })
        })
    } catch (error) {
        res.status(400).json({ success: false, message: "some issue", error: error.message })
    }

}

export const logOut = async (req, res) => {
    try {
        res.clearCookie("accessToken").status(200).json({
            message: "Sucess",
        })
    } catch (error) {
        res.status(400).json({ success: false, message: "some issue", error: error.message })
    }

}