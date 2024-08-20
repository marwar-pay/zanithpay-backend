import { Schema, model } from "mongoose";

const payOutSchema = new Schema({
    memberId: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: [true, "Please Select Member id!"]
    },
    amount: {
        type: Number,
        required: [true, "Required Amount !"]
    },
    chargeAmount: {
        type: Number,
        required: [true, "Required payment gatway charge !"]
    },
    finalAmount: {
        type: Number,
        required: [true, "Required Credit amount !"]
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
        trim: true,
        required: [true, "Required Optx ID !"]
    },
    isSuccess: {
        type: String,
        enum: ["Pending", "Failed", "Success"],
    },
}, { timestamps: true });

export default new model("payOutRecode", payOutSchema);