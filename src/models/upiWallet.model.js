import { Schema, model } from "mongoose";

const upiwalletSchema = new Schema({
    memberId: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: [true, "Please Select Member Id !"]
    },
    transactionType: {
        type: String,
        enum: ["Dr.", "Cr."],
        required: [true, "Required Type of Transaction Dr. or Cr.!"]
    },
    transactionAmount: {
        type: Number,
        required: [true, "Required transaction amount !"]
    },
    beforeAmount: {
        type: Number,
        required: [true, "Required Before transaction amount !"]
    },
    afterAmount: {
        type: Number,
        required: [true, "Required After transaction amount !"]
    },
    description: {
        type: String,
        required: [true, "Required transaction description !"]
    },
    transactionStatus: {
        type: String,
        enum: ["Pending", "Failed", "Success"],
        default: "Pending"
    },
}, { timestamps: true });

export default new model("upiWallet", upiwalletSchema);