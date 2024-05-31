import mongoose from "mongoose";

const ChatAttachmentSchema = new mongoose.Schema({
    image: {},
    video: {},
    audio: {},
    others: {},
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    recieverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    TextMessage: {
        type: String
    }
}, {timestamps: true});

export default mongoose.model('Attachment', ChatAttachmentSchema);