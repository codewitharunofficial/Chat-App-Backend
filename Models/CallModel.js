import mongoose from "mongoose";

const callSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  receiver: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  duration: { type: Number },
  date: { type: Date, default: Date.now }
}, {timestamps: true});

export default mongoose.model('Call', callSchema);
