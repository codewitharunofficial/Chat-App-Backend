import express from 'express';
import { createConvo, getAllChats, getAllMessages } from '../Controllers/ChatController.js';
// import { requireSignIn } from '../MiddleWares/IsActive.js';



const router = express.Router();


//Post New Messange Or Send New Message

router.post('/create-conversation', createConvo);

router.get('/chats/:id', getAllChats);

router.post('/fetch-messages', getAllMessages);



export default router