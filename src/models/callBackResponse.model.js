import { Schema, model } from "mongoose";

const callBackResponseURL = new Schema({
    memberId: {
        type: Schema.Types.ObjectId,
        ref: "users",
        required: [true, "Please Select Member Id !"]
    },
    payInCallBackUrl: {
        type: String,
        required: [true, "Please Enter Payin callback URL !"]
    },
    payOutCallBackUrl: {
        type: String,
        required: [true, "Please Enter Payout callback URL !"]
    },
    isActive: {
        type: Boolean,
        default: true
    },
}, { timestamps: true });

export default new model("callBackURL", callBackResponseURL);