import { Schema, model } from "mongoose";

const chargeBackSchema = new Schema({
    memberId: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: [true, "Please Select Member Id !"]
    },
    payerName: {
        type: String,
    },
    trxId: {
        type: String,
        trim: true,
        index: true,
        unique: [true, "Trx Id should be Unique"],
        required: [true, "Required TrxId !"]
    },
    amount: {
        type: Number,
        required: [true, "Required Amount !"]
    },
    vpaId: {
        type: String,
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

export default new model("chargeBackRecode", chargeBackSchema);