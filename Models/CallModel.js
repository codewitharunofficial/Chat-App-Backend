import mongoose from "mongoose";

const callSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  senderName: {type: String, required: true},
  receiver: { type: String, required: true },
  receiverName: { type: String, required: true },
  senderPhoto: {type: String},
  receiverPhoto: {type: String},
  startTime: { type: Date },
  endTime: { type: Date },
  duration: { type: Number },
  date: { type: Date, default: Date.now }
}, {timestamps: true});

export default mongoose.model('Call', callSchema);
