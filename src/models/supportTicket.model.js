import { Schema, model } from "mongoose";

const supportSchema = new Schema({
    memberId: {
        type: Schema.Types.ObjectId,
        ref: "users",
        required: [true, "Please Select Member Id !"]
    },
    TicketID: {
        type: String,
        index:true,
        required: [true, "Please Enter Ticket Id !"]
    },
    subject: {
        type: String,
        required: [true, "Required subject !"]
    },
    relatedTo: {
        type: String,
        required: [true, "Required related Ticket!"]
    },
    message: {
        type: String,
        required: [true, "Required message Related issue!"]
    },
    isStatus: {
        type: String,
        enum: ["Pending", "Resolved", "Rejected"],
        default: "Pending"
    },
}, { timestamps: true });

export default new model("supportTicket", supportSchema);