import mongoose from 'mongoose';

const ConversationSchema = new mongoose.Schema({
        participants: [],
}, {timestamps: true});

export default mongoose.model('Conversation', ConversationSchema);