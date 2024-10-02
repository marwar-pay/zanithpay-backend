import { ApiResponse } from "../../utils/ApiResponse.js"
import userDB from "../../models/user.model.js"
import { asyncHandler } from "../../utils/asyncHandler.js"
import { ApiError } from "../../utils/ApiError.js"

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

export const userInfo = asyncHandler(async (req, res) => {
    let userId = "66dc3720a5218282ea0c6f53"
    let user = await userDB.aggregate([{ $match: {} }, { $lookup: { from: "packages", localField: "package", foreignField: "_id", as: "package" } }, {
        $unwind: {
            path: "$package",
            preserveNullAndEmptyArrays: true,
        },
    }]).then((data) => {
        res.status(200).json(new ApiResponse(200, req.user))
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
});

export const updatePassword = asyncHandler(async (req, res) => {
    let userId = req.params.id;
    let data = await userDB.findByIdAndUpdate(userId, req.body, { new: true })

    if (!data) {
        return res.status(400).json({ message: "Failed", data: "Profile not update or Not Found !" })
    }
    res.status(200).json(new ApiResponse(200, data))
});

export const updateTrxPassword = asyncHandler(async (req, res) => {
    let userId = req.params.id;
    let data = await userDB.findByIdAndUpdate(userId, req.body, { new: true })

    if (!data) {
        return res.status(400).json({ message: "Failed", data: "Profile not update or Not Found !" })
    }
    res.status(200).json(new ApiResponse(200, data))
});

export const logInUserPannel = asyncHandler(async (req, res) => {
    let { userName, password } = req.body;
    let user = await userDB.aggregate([{ $match: { userName: userName } }, { $project: { "_id": 1, "userName": 1, "memberId": 1, "memberType": 1, "password": 1, "isActive": 1 } }])
    if (!user?.length) {
        return res.status(404).json({ message: "Failed", data: "Invalid Credential Try Again !" })
    }
    if (user[0]?.password !== password) {
        return res.status(404).json({ message: "Failed", data: "Invalid Credential Try Again !" })
    }

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user[0]._id)
    let options = { httpOnly: true, secure: true }
    let storeValue = { user: user[0], accessToken, refreshToken }
    return res.cookie("accessTokenUser", accessToken, options).cookie("refreshTokenUser", refreshToken, options).status(200).json(
        new ApiResponse(200, storeValue, "User logged In Successfully")
    )

})

export const logOutUserPannel = asyncHandler(async (req, res) => {
    let userInfo = await userDB.findById(req.user._id);
    userInfo.refreshToken = undefined;
    await userInfo.save();
    res.clearCookie("accessTokenUser").clearCookie("refreshTokenUser").status(200).json(new ApiResponse(200, null, "User logged Out Successfully"))

})