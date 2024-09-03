import mongoose from "mongoose";

const StatusSchema = new mongoose.Schema({
    author:{
       type: {},
       required: true,
       
    },
    status:{
        type: {},
        required: true
    }, 
    caption: {
        type: String,
    },
    
    authorId:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    expiresAt : {
        type: Date,
        default: () => new Date(Date.now() + 60*60*1000*24)
    },
    type: {
        type: String,
        default: "Image",
        enum: ["Image", "Video"]
    }
    
}, {timestamps: true});

export default mongoose.model('Status', StatusSchema);