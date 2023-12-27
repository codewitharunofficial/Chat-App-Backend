import ChatModel from "../Models/ChatModel.js";
import ConversationModel from "../Models/ConversationModel.js";
import userModel from "../Models/userModel.js";

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


export const createConvo = async (req, res) => {
      try {
        const {sender, receiver} = req.body;

        const user1 = await userModel.findOne({_id: receiver});

        if(!user1) {
            res.status(201).send({
                success: false,
                message: "No user1 Found"
            })
        } else {
            const Convo = await ConversationModel.findOne({senderId: sender, receiverId: receiver});

            const user2 = await userModel.findOne({_id: sender});
            if(!user2) {
                res.status(201).send({
                    success: false,
                    message: "No user2 Found"
                })
            }

        if(Convo) {
            res.status(200).send({
                success: true,
                message: 'Found a chat',
                Convo
            })
        } else {
            const newConvo = new ConversationModel({sender: user2, receiver: user1, receiverId: receiver, senderId: sender});
            await newConvo.save();
            res.status(200).send({
                success: true,
                message: "New Conversation Created Successfully",
                newConvo: newConvo._id
            });
        }

        }
        
      } catch (error) {
           res.status(400).send({
            success: false,
            message: "Something went wrong",
            error: error.message
           })
      }
}


export const getAllChats = async (req, res) => {
    
         try {
            const {id} = req.params;

         const chats = await ConversationModel.find({$or: [{senderId: id} , {receiverId: id}]}).sort({updatedAt: -1});

         if(!chats) {
            res.status(401).send({
                success: false,
                message: "No Conversations found! Create now to get one",
            })
         } else {
            res.status(200).send({
                success: true,
                message: "Chats Fetched Successfully",
                chats
            })
         }
         } catch (error) {
            res.status(400).send({
                success: false, 
                message: "Something went wrong",
                error: error.message
            })
         }
}


export const deleteConversation = async (req, res) => {
      try {
        const {id} = req.params;

        switch(true) {
            case !id: throw new Error("Coversation ID is required to make a delete request");
        }

        const convo = await ConversationModel.findByIdAndDelete({_id: id});
        if(!convo) {
            res.status(201).send({
                success: false,
                message: "Either The Conversation Doesn't Exist Or Has Already Been Deleted"
            })
        } else {
            res.status(200).send({
                success: true,
                message: "Coversation Has Been Deleted Successfully"
            })
        }

      } catch (error) {
         res.status(400).send({
            success: false,
            message: "Something Went Wrong",
            error: error.message
         })
      }

}

export const getAllMessages = async (req, res) => {
    try {
        const {sender, reciever} = req.body;

    switch(true) {
        case !sender: throw new Error("Sender is required");
        case !reciever: throw new Error("Receiver is required");

    }

    const messages = await ChatModel.find({$or: [{sender: sender, reciever: reciever}, {sender: reciever, reciever: sender}]}).sort({createdAt: -1});

    if(!messages) {
        res.send({
            message: "No Messages Found!!"
        })
    } else {
        res.status(200).send({
            success: true,
            message: "Messages Fetched Successfully",
            messages
        })
    }
    } catch (error) {
        res.status(400).send({
            success: false,
            message: "Something went wrong",
            error: error.message
        })
    }
}

export const deleteMessage = async (req, res) => {
      try {
        const {id} = req.params;
        switch(true) {
            case !id : throw new Error("Message Id is required to make a delete request");
        }

        const message = await ChatModel.findByIdAndDelete({_id: id});
        if(!message) {
            res.status(201).send({
                success: false,
                message: "Either the message doesn't Exist Or Has Already Been Deleted" 
            })
        } else {
            res.status(200).send({
                success: true,
                message: "Message Deleted SuccessFully",
            });
        }
        

      } catch (error) {
           res.status(400).send({
            success: false,
            message: "Something Went Wrong",
            error: error.message
           })
      }
}