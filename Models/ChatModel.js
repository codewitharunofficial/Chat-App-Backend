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

    type:{
      type: String,
      default: "Text",
      enum: ["Text", "Audio", "Video", "Image", "Voice","Document", "Location"]
    },
    reply: {
      type: {},
    },
    isReplied: {
      type: Boolean,
      default: false,
      enum: [false, true]
    },
    repliedBy: {
      type: mongoose.Schema.Types.ObjectId,
    },
    
}, {timestamps: true});

export default mongoose.model('Message', MessageSchema);