import express from 'express';
import { sendMessage } from '../Controllers/ChatController.js';
// import { requireSignIn } from '../MiddleWares/IsActive.js';


const router = express.Router();

//Post New Messange Or Send New Message

router.post('/send-message', sendMessage);





export default router