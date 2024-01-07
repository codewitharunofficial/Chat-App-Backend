import express from 'express';
import { createConvo, deleteConversation, deleteMessage, getAllChats, getAllMessages, markMessageAsRead, sendMessage, setMessagesAsRead } from '../Controllers/ChatController.js';
// import { requireSignIn } from '../MiddleWares/IsActive.js';



const router = express.Router();


//Post New Messange Or Send New Message

router.post('/send-message', sendMessage);

router.post('/create-conversation', createConvo);

router.get('/chats/:id', getAllChats);

router.post('/fetch-messages', getAllMessages);

router.delete('/delete-message/:id', deleteMessage);

router.post('/delete-convo/:id', deleteConversation);

router.post('/read-message/:id', setMessagesAsRead);

router.get('/isRead/:id', markMessageAsRead);



export default router