import { Schema, model } from "mongoose";

const qrGenerationSchema = new Schema({
    memberId: {
        type: Schema.Types.ObjectId,
        ref: "users",
        required: [true, "Please Select Member Id !"]
    },
    trxId: {
        type: String,
        unique:[true,"Trx Id should be Unique"],
        required: [true, "Required TrxId !"]
    },
    refId: {
        type: String,
    },
    amount: {
        type: Number,
        required: [true, "Required Amount !"]
    },
    name: {
        type: String,
        required: [true, "Required Name !"]
    },
    ip: {
        type: String,
    },
    qrData: {
        type: String,
    },
    callBackStatus: {
        type: Boolean,
        default: false
    },
}, { timestamps: true });

export default new model("qrGenerationRecode", qrGenerationSchema);