import { Schema, model } from "mongoose";

const ipWhiteListSchema = new Schema({
    memberId: {
        type: Schema.Types.ObjectId,
        ref: "user",
        index: true,
        unique: true,
        required: [true, "Please Select Member Id !"]
    },
    ipUser: {
        type: String,
        trim: true,
        required: [true, "Required user Ip !"]
    },
    ipUserDev: {
        type: String,
        trim: true,
    },
    isStatus: {
        type: Boolean,
        required: [true, "Required Status Ip Addresh !"]
    },
}, { timestamps: true });

export default new model("ipWhiteList", ipWhiteListSchema);