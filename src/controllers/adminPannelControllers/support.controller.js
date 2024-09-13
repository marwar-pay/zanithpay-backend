import supportModel from "../../models/supportTicket.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const getAllTicket = asyncHandler(async (req, res) => {
    let pack = await supportModel.find();
    if (!pack) {
        return new ApiError(400, "No Package Avabile !")
    }
    res.status(200).json(new ApiResponse(200, pack))
});

export const getSingleTicket = asyncHandler(async (req, res) => {
    let pack = await supportModel.find();
    if (!pack) {
        return new ApiError(400, "No Package Avabile !")
    }
    res.status(200).json(new ApiResponse(200, pack))
});

export const updateTicketStatus = asyncHandler(async (req, res) => {
    let pack = await supportModel.find();
    if (!pack) {
        return new ApiError(400, "No Package Avabile !")
    }
    res.status(200).json(new ApiResponse(200, pack))
});

export const allPendingTicket = asyncHandler(async (req, res) => {
    let pack = await supportModel.find();
    if (!pack) {
        return new ApiError(400, "No Package Avabile !")
    }
    res.status(200).json(new ApiResponse(200, pack))
})