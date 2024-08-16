import { Schema, model } from "mongoose";

const payInSchema = new Schema({
    memberId: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: [true, "Please Select Member Id !"]
    },
    payerName: {
        type: String,
        required: [true, "Required Payber Name !"]
    },
    trxId: {
        type: String,
        trim: true,
        unique: true,
        index: true,
        required: [true, "Required TrxId !"]
    },
    amount: {
        type: String,
        required: [true, "Required Amount !"]
    },
    chargeAmount: {
        type: String,
        required: [true, "Required payment gatway charge !"]
    },
    finalAmount: {
        type: String,
        required: [true, "Required Credit amount !"]
    },
    vpaId: {
        type: String,
        required: [true, "Required VPA ID !"]
    },
    bankRRN: {
        type: String,
        required: [true, "Required bank RRN !"]
    },
    description: {
        type: String,
        required: [true, "Required Description !"]
    },
    isSuccess: {
        type: String,
        enum: ["Pending", "Failed", "Success"],
        required: [true, "Required Status Success or Failed !"]
    },
}, { timestamps: true });

export default new model("payInRecode", payInSchema);