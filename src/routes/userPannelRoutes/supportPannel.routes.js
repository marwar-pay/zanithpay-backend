import express from "express";
const router = express.Router();
import { celebrate, Joi } from "celebrate";
import { userPannelAuth } from "../../middlewares/userPannelAuth.js";
import { addSupportTicket, getSupportTicket, singleSupportTicket } from "../../controllers/userPannelControllers/supportPannel.controller.js";

router.post("/addSupportTicket", celebrate({
    body: Joi.object({
        subject: Joi.string().required(),
        relatedTo: Joi.string().required(),
        message: Joi.string().required(),
    })
}), userPannelAuth, addSupportTicket);

router.get("/getSupportTicket", userPannelAuth, getSupportTicket);

router.get("/singleSupportTicket/:ticketId", userPannelAuth, singleSupportTicket);

export default router;