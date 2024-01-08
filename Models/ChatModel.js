import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      required:  true,
      role: 'sender',
      ref: 'User'
    },
    from: {},
    reciever: {
      type: mongoose.Schema.Types.ObjectId,
      required:  true,
      role: 'reciever',
      ref: 'User'
    },
    to: {},
    message: {
      type: {},
      required: true
    },

    read: {
      type: Boolean,
      default: false
    }
    
}, {timestamps: true});

export default mongoose.model('Message', MessageSchema);