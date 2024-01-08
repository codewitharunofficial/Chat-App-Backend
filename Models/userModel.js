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
     answer: {
      type: String,
      required: true
     },
     profilePhoto: {
      type: {}
     },
     Is_Online: {
      type: String,
      default: 'false'
     },

}, {timestamps: true});

export default mongoose.model('User', userSchema);