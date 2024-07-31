import { Schema, model } from "mongoose";

const userSchema = new Schema({
    userName: {
        type: String,
        unique: true,
        required: [true, "Please Enter username !"]
    },
    memberId: {
        type: String,
        unique: true,
        required: [true, "Please Enter Member Id !"]
    },
    memberType: {
        type: String,
        required: [true, "Please Select member Type !"]
    },
    fullName: {
        type: String,
        required: [true, "Please Enter your Full Name !"]
    },
    email: {
        type: String,
        required: [true, "Please Enter your email id !"]
    },
    mobileNumber: {
        type: String,
        required: [true, "Please Enter your Mobile Number !"]
    },
    password: {
        type: String,
        required: [true, "Please Enter your Password !"]
    },
    trxPassword: {
        type: String,
        required: [true, "Please Enter your Transaction Password !"]
    },
    addresh: {
        country: {
            type: String,
            required: [true, "Please Enter Country"]
        },
        state: {
            type: String,
            required: [true, "Please Enter State"]
        },
        city: {
            type: String,
            required: [true, "Please Enter City !"]
        },
        addresh: {
            type: String,
            required: [true, "Please Enter Addresh !"]
        },
    },
    package: {
        type: Schema.Types.ObjectId,
        ref: "packages",
        required: [true, "Please Select Package !"]
    },
    minWalletBalance: {
        type: Number,
        required: [true, "Please Enter minimum Walllet Balance Hold !"]
    },
    walletBalance: {
        type: Number,
    },
    isActive: {
        type: Boolean,
        default: true
    },
}, { timestamps: true });

export default new model("user", userSchema);