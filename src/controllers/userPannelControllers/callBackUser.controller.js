import { ApiResponse } from "../../utils/ApiResponse.js"
import callBackModel from "../../models/callBackResponse.model.js"
import { asyncHandler } from "../../utils/asyncHandler.js"
import { ApiError } from "../../utils/ApiError.js"

export const addCallBackUrl = asyncHandler(async (req, res) => {
    let userId = req.user._id
    let storeData = {
        memberId: userId,
        payInCallBackUrl: req.body?.payInCallBackUrl,
        payOutCallBackUrl: req.body?.payOutCallBackUrl,
        isActive: true
    }
    let callBackUrlAdd = await callBackModel.create(storeData).catch((error) => {
        if (error.errorResponse.code === 11000) {
            return res.status(400).json({ message: "Failed", data: "duplicate collection already callback url set ! Please Update " })
        }
        res.status(400).json({ message: "Failed", data: error })
    })
    res.status(200).json(new ApiResponse(201, callBackUrlAdd));
});

export const getCallBackUrl = asyncHandler(async (req, res) => {
    let userId = req.user._id
    let callBackUrl = await callBackModel.findOne({ memberId: userId });
    if (!callBackUrl) {
        return res.status(400).json({ message: "Failed", data: "No CallBack Url Found Plese Add !" })
    }
    res.status(200).json(new ApiResponse(200, callBackUrl));
});

export const updateCallBackUrl = asyncHandler(async (req, res) => {
    let userId = req.user._id
    let callBackUrlAdd = await callBackModel.findOneAndUpdate({ memberId: userId }, req.body, { new: true });
    if (!callBackUrlAdd) {
        return res.status(400).json({ message: "Failed", data: "not update your url" })
    }
    res.status(200).json(new ApiResponse(200, callBackUrlAdd));
});