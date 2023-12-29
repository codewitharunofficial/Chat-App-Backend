import mongoose from "mongoose";

const ChatAttachmentSchema = new mongoose.Schema({
    image: [],
    video: [],
    others: [],
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {timestamps: true});

export default mongoose.model('Attachment', ChatAttachmentSchema);