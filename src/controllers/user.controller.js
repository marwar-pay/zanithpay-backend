import userDB from "../models/user.model.js"
import bcrypt from "bcrypt"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"

// Generation accessToken and refereshToken
const generateAccessAndRefereshTokens = async (userId) => {
    try {
        const user = await userDB.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

export const getUser = asyncHandler(async (req, res) => {
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
})

export const getSingleUser = asyncHandler(async (req, res) => {
    let data = req.params.id
    let user = await userDB.findById(data);
    if (!user) {
        return res.status(400).json({ message: "Failed", data: "User Not Avabile" })
    }
    res.status(200).json({ message: "Success", data: user })
})

export const addUser = asyncHandler(async (req, res) => {
    let user = await userDB.create(req.body).then((data) => {
        res.status(200).json({
            message: "Sucess",
            data
        })
    })
})

export const updateUser = asyncHandler(async (req, res) => {
    let id = req.params.id
    let user = await userDB.findByIdAndUpdate(id, req.body).then((data) => {
        res.status(200).json({
            message: "Sucess",
            data
        })
    })
})

export const loginUser = asyncHandler(async (req, res) => {
    let { username, password } = req.body;
    let user = await userDB.aggregate([{ $match: { userName: username } }, { $project: { "_id": 1, "userName": 1, "memberId": 1, "memberType": 1, "password": 1, "isActive": 1 } }])
    if (!user?.length) {
        return res.status(404).json({ message: "Failed", data: "Invalid Credential Try Again !" })
    }
    if (user[0]?.password !== password) {
        return res.status(404).json({ message: "Failed", data: "Invalid Credential Try Again !" })
    }

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user[0]._id)
    let options = { httpOnly: true, secure: true }
    return res.cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).status(200).json({
        message: "Sucess",
        data: user[0], accessToken, refreshToken,
        Info: "User logged In Successfully"

    })

})

export const registerUser = asyncHandler(async (req, res) => {
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
})

export const logOut = asyncHandler(async (req, res) => {
    let userInfo = await userDB.findById(req.user._id);
    userInfo.refreshToken = undefined;
    await userInfo.save();
    res.clearCookie("accessToken").clearCookie("refreshToken").status(200).json({
        message: "Sucess",
    })
})