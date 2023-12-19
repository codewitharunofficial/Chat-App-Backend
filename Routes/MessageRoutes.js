import express from 'express';
import { sendMessage } from '../Controllers/ChatController.js';
import ExpressFormidable from 'express-formidable';
// import { requireSignIn } from '../MiddleWares/IsActive.js';
import {Server} from 'socket.io';
import http from 'http';
import ChatModel from '../Models/ChatModel.js';



const router = express.Router();

router.use(ExpressFormidable());


//Post New Messange Or Send New Message

router.post('/send-messasge', async(req, res) => {

    const {sender, reciever, message} = req.fields;

    switch(true) {
        case !sender: throw new Error("Sender is required")
        case !reciever: throw new Error("Reciever is required")
        case !message: throw new Error("Message is required")
    }

    const newMessage = new ChatModel({sender: sender, reciever: reciever, message: message}).save()

    req.io.emit('new-message', {sender, reciever, message})
    res.status(200).send({
        sucess: true,
        message: 'message sent successfully',
        newMessage
    })

})



export default router