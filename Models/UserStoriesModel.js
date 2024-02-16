import mongoose from "mongoose";

const UserStoriesModel = new mongoose.Schema({
    author:{
       type: {},
       required: true,
       
    },
    stories:{
        type: [],
        required: true
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
    length: {
        type: Number,
        default: 0,
        required: true
    }
    
}, {timestamps: true});

export default mongoose.model('Stories', UserStoriesModel);