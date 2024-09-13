import { ApiResponse } from "../../utils/ApiResponse.js"
import supportModel from "../../models/supportTicket.model.js"
import { asyncHandler } from "../../utils/asyncHandler.js"
import { ApiError } from "../../utils/ApiError.js"

export const addSupportTicket = asyncHandler(async (req, res) => {
    let userId = req.user._id
    const { subject, relatedTo, message } = req.body;
    let uniqueTicketId = `SU${Date.now()}`
    let supportTicketCreate = await supportModel.create({
        memberId: userId, TicketID: uniqueTicketId, subject: subject, relatedTo: relatedTo, message: message,
    });
    res.status(200).json(new ApiResponse(201, supportTicketCreate));
});

export const getSupportTicket = asyncHandler(async (req, res) => {
    let userId = req.user._id
    let supportTicketCreate = await supportModel.find({ memberId: userId });
    if (supportTicketCreate.length === 0) {
        return res.status(400).json({ message: "Failed", data: "No Ticket Avabile !" })
    }
    res.status(200).json(new ApiResponse(200, supportTicketCreate));
});

export const singleSupportTicket = asyncHandler(async (req, res) => {
    let ticketId = req.params.ticketId;
    let userId = req.user._id
    let supportTicket = await supportModel.find({ TicketID: ticketId, memberId: userId });
    if (supportTicket.length === 0) {
        return res.status(400).json({ message: "Failed", data: "No Ticket Avabile !" })
    }
    res.status(200).json(new ApiResponse(200, supportTicket));
});