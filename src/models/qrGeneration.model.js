import { Schema, model } from "mongoose";

const qrGenerationSchema = new Schema({
    memberId: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: [true, "Please Select Member Id !"]
    },
    trxId: {
        type: String,
        required: [true, "Required TrxId !"]
    },
    refId: {
        type: String,
    },
    amount: {
        type: String,
        required: [true, "Required Amount !"]
    },
    ip: {
        type: String,
    },
    qrData: {
        type: String,
        required: [true, "Required Qr Data !"]
    },
    callBackStatus: {
        type: Boolean,
        required: [true, "Callback status required !"]
    },
}, { timestamps: true });

export default new model("qrGenerationRecode", qrGenerationSchema);