import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    sender: {
      type: {},
      role: "sender",
      
    },
    receiverId : {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    receiver: {
      type: {},
      role: "reciever",
    },
    chat: [],
    read: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export default mongoose.model("Conversation", ConversationSchema);
