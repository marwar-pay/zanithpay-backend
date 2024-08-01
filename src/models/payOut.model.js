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
    trxId: {
        type: String,
        required: [true, "Required Trx ID !"]
    },
    optxId: {
        type: String,
        required: [true, "Required Optx ID !"]
    },
    bankRRN: {
        type: String,
        required: [true, "Required bank RRN !"]
    },
    isSuccess: {
        type: Boolean,
        required: [true, "Required Status Success or Faild !"]
    },
}, { timestamps: true });

export default new model("payOutRecode", payOutSchema);