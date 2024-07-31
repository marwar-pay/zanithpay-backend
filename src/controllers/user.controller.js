import userDB from "../models/user.model.js"

export const getUser = async (req, res) => {
    let user = await userDB.find();
    res.status(200).json({
        message: "Sucess",
        user
    })
}

export const addUser =async (req, res) => {
    let user = await userDB.create(req.body);
    res.status(200).json({
        message: "Sucess",
        user
    })
}