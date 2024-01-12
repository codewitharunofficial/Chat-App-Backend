import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
     name: {
        type: String,
        required: true,
     },
     phone: {
         type: String,
         required: true,
         unique: true
     },
     password: {
        type: String,
        required: true,
     },
     email: {
        type: String,
        required: true,
        unique: true
     },
     profilePhoto: {
      type: {}
     },
     Is_Online: {
      type: String,
      default: 'false',
     },
     lastseen: Date,
     emailStatus: {
      type: String,
      default: "Pending"
     },
     blocked_users: [],

}, {timestamps: true});

export default mongoose.model('User', userSchema);