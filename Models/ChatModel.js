import mongoose, { mongo } from "mongoose";

const MessageSchema = new mongoose.Schema({
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      required:  true,
      role: 'sender',
      ref: 'User'
    },
    reciever: {
      type: mongoose.Schema.Types.ObjectId,
      required:  true,
      role: 'reciever',
      ref: 'User'
    },
    message: {
      type: String,
      required: true
    }
}, {timestamps: true});

export default mongoose.model('Message', MessageSchema);