import { ApiResponse } from "../../utils/ApiResponse.js"
import userDB from "../../models/user.model.js"
import { asyncHandler } from "../../utils/asyncHandler.js"
import { ApiError } from "../../utils/ApiError.js"

export const userInfo = asyncHandler(async (req, res) => {
    let userId = "66dc3720a5218282ea0c6f53"
    let user = await userDB.aggregate([{ $match: {} }, { $lookup: { from: "packages", localField: "package", foreignField: "_id", as: "package" } }, {
        $unwind: {
            path: "$package",
            preserveNullAndEmptyArrays: true,
        },
    }]).then((data) => {
        res.status(200).json(new ApiResponse(200, data))
    })
})

export const changePassword = asyncHandler(async (req, res) => {
    let user = await userDB.aggregate([{ $lookup: { from: "packages", localField: "package", foreignField: "_id", as: "package" } }, {
        $unwind: {
            path: "$package",
            preserveNullAndEmptyArrays: true,
        },
    }]).then((data) => {
        res.status(200).json(new ApiResponse(200, data))
    })
})

export const updateProfile = asyncHandler(async (req, res) => {
    let userId = req.params.id;
    let data = await userDB.findByIdAndUpdate(userId, req.body, { new: true })

    if (!data) {
        return res.status(400).json({ message: "Failed", data: "Profile not update or Not Found !" })
    }
    res.status(200).json(new ApiResponse(200, data))
})

export const logIn = asyncHandler(async (req, res) => {
    const { userName, password } = req.body;
    let user = await userDB.findOne({ userName: userName, password: password, isActive: true })

    if (!user) {
        return res.status(400).json({ message: "Failed", data: "Invalid Credential Try Again !" })
    }

    if (user?.memberType !== "Users") {
        return res.status(400).json({ message: "Failed", data: "User Role Not Appropriate Only Users Login !" })
    }

    res.status(200).json(new ApiResponse(200, user))
})