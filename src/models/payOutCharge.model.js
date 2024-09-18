import { Schema, model } from "mongoose";

const payOutPackageSchema = new Schema({
    payOutPackageName: {
        type: String,
        required: [true, "Please Enter PayoutPackage Name !"]
    },
    payOutChargeRange: [{
        lowerLimit: {
            type: Number,
            required: [true, "Please Enter Lower Limit"]
        },
        upperLimit: {
            type: Number,
            required: [true, "Please Enter upper Limit"]
        },
        chargeType: {
            type: String,
            enum: ["Flat", "Percentage"],
            required: [true, "Please select Type Charge !"]
        },
        charge: {
            type: Number,
            required: [true, "Please Enter Charge value !"]
        }
    }],
    isActive: {
        type: Boolean,
        default: true
    },
}, { timestamps: true });

export default new model("payOutPackage", payOutPackageSchema);