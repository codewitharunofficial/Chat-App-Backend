import mongoose, { mongo } from "mongoose";

const UnreadMessageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        ref: 'User'
    },
    reciever: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        ref: 'User'
    },
    messages: [],
    status: {
     type: Boolean,
     default: false
    },
}, {timestamps: true});

export default mongoose.model('Unread', UnreadMessageSchema);