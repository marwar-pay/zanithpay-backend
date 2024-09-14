import express from "express";
import { userVerify } from "../../middlewares/userAuth.js";
const router = express.Router();
import { celebrate, Joi } from "celebrate";
import { allPendingTicket, getAllTicket, getSingleTicket, updateTicketStatus } from "../../controllers/adminPannelControllers/support.controller.js";

router.get("/allGenTicket", userVerify, getAllTicket);

router.get("/getSingleTicket/:ticketId", celebrate({
    params: Joi.object({
        ticketId: Joi.string().trim().required(),
    })
}), userVerify, getSingleTicket);

router.post("/updateTicketStatus/:id", celebrate({
    body: Joi.object({
        isStatus: Joi.string().valid("Pending", "Resolved", "Rejected").required(),
    }),
    params: Joi.object({
        id: Joi.string().trim().length(24).required(),
    })
}), userVerify, updateTicketStatus);

router.get("/allPendingTicket", userVerify, allPendingTicket);

export default router;