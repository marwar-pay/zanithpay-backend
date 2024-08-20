import { Schema, model } from "mongoose";

const payOutSchema = new Schema({
    memberId: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: [true, "Please Select Member id!"]
    },
    mobileNumber: {
        type: String,
        required: [true, "Required Mobile numer !"]
    },
    accountHolderName: {
        type: String,
        required: [true, "Required Account Holder Name !"]
    },
    accountNumber: {
        type: String,
        required: [true, "Required Account Number !"]
    },
    ifscCode: {
        type: String,
        required: [true, "Required IFSC Code!"]
    },
    amount: {
        type: Number,
        required: [true, "Required Amount !"]
    },
    chargeAmount: {
        type: Number,
    },
    finalAmount: {
        type: Number,
    },
    trxId: {
        type: String,
        trim: true,
        unique: true,
        index: true,
        required: [true, "Required Trx ID !"]
    },
    optxId: {
        type: String,
    },
    bankRRN: {
        type: String,
    },
    isSuccess: {
        type: String,
        enum: ["Pending", "Failed", "Success"],
        default: "Pending",
    },
}, { timestamps: true });

export default new model("payOutRecode", payOutSchema);