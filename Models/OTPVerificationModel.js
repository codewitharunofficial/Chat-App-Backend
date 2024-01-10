import mongoose from "mongoose";

const OTPSchema = new mongoose.Schema({

    email: {
        type: String,
    },

    OTP : {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: "Pending"
    },
    generatedAt: {
        type: Date,
        default: Date.now()
    },

    expiresAt: {
        type: Date,
        default: () => new Date(+ new Date() + 1*60*1000)
    },
}, {timestamps: true});

export default mongoose.model("OTP", OTPSchema);