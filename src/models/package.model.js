import { Schema, model } from "mongoose";

const packageSchema = new Schema({
    packageName: {
        type: String,
        required: [true, "Please Enter Package Name !"]
    },
    packageInfo: {
        type: String,
    },
    isActive: {
        type: Boolean,
        default: true
    },
}, { timestamps: true });

export default new model("package", packageSchema);