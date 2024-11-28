import { Schema, model } from "mongoose";

const packageSchema = new Schema({
    packageName: {
        type: String,
        required: [true, "Please Enter Package Name !"]
    },
    packageInfo: {
        type: String,
    },
    packagePayOutCharge: {
        type: Schema.Types.ObjectId,
        ref: "payoutpackages",
        required: [true, "Please Select Payout Package !"]
    },
    packagePayInCharge: {
        type: Schema.Types.ObjectId,
        ref: "payinpackages",
        required: [true, "Please Select Payin Package !"]
    },
    isActive: {
        type: Boolean,
        default: true
    },
}, { timestamps: true });

export default new model("package", packageSchema);