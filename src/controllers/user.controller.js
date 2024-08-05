import userDB from "../models/user.model.js"

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

export const loginUser = async (req, res) => {
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

export const registerUser = async (req, res) => {
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