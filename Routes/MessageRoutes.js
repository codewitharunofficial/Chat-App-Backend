import express from 'express';
import { sendMessage } from '../Controllers/ChatController.js';
import ExpressFormidable from 'express-formidable';
// import { requireSignIn } from '../MiddleWares/IsActive.js';


const router = express.Router();

router.use(ExpressFormidable());

//Post New Messange Or Send New Message

router.post('/send-message', ExpressFormidable(), sendMessage);





export default router