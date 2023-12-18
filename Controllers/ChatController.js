import ChatModel from "../Models/ChatModel.js";

export const sendMessage = async (req, res) => {
    try {
        const {sender, reciever, message} = req.fields;
        switch(true) {
            case !sender: throw new Error("Sender Is Required");
            case !message: throw new Error("Message Can't Be Empty");
            case !reciever: throw new Error("Receipent Is Required");
        }

        const coversation = new ChatModel({...req.fields});
        await coversation.save();
        
        res.status(200).send({
            success: true,
            message: "Message Sent Successfully",
            coversation
        });

    } catch (error) {
        res.status(400).send({
            success: false,
            message: 'Error while sending message',
            error: error.message
        })
    }
}