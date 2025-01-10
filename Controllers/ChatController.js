import ChatModel from "../Models/ChatModel.js";
import ConversationModel from "../Models/ConversationModel.js";
import userModel from "../Models/userModel.js";
import cloudinary from "../Helpers/cloudinary.js";

export const sendMessage = async (req, res) => {
  try {
    const { sender, reciever, message, reply } = req.body;
    switch (true) {
      case !sender:
        throw new Error("Sender Is Required");
      case !message:
        throw new Error("Message Can't Be Empty");
      case !reciever:
        throw new Error("Receipent Is Required");
    }

    const coversation = new ChatModel({
      sender: sender,
      reciever: reciever,
      message: { message: message },
      reply: reply ? reply : null
    });
    await coversation.save();

    res.status(200).send({
      success: true,
      message: "Message Sent Successfully",
      coversation,
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "Error while sending message",
      error: error.message,
    });
  }
};

export const createConvo = async (req, res) => {
  try {
    const { sender, receiver } = req.body;
    console.log(req.body);

    const user1 = await userModel.findOne({ phone: receiver });
    const user2 = await userModel.findOne({ phone: sender });

    if (!user1) {
      res.status(201).send({
        success: false,
        message: "No user1 Found",
      });
      if (!user2) {
        res.status(201).send({
          success: false,
          message: "No user2 Found",
        });
      }
    } else {
      const Convo = await ConversationModel.findOne({
        $or: [
          { senderId: user2._id, receiverId: user1._id },
          { senderId: user1._id, receiverId: user2._id },
        ],
      });

      if (Convo) {
        res.status(200).send({
          success: true,
          message: "Found a chat",
          Convo,
        });
      } else {
        const newConvo = new ConversationModel({
          sender: user2,
          receiver: user1,
          receiverId: user1._id,
          senderId: user2._id,
        });
        await newConvo.save();
        res.status(200).send({
          success: true,
          message: "New Conversation Created Successfully",
          newConvo: newConvo._id,
        });
      }
    }
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

export const getAllChats = async (req, res) => {
  try {
    const { id } = req.params;

    const chats = await ConversationModel.find({
      $or: [{ senderId: id }, { receiverId: id }],
    }).sort({"chat.updatedAt": -1});

    if (!chats) {
      res.status(401).send({
        success: false,
        message: "No Conversations found! Create now to get one",
      });
    } else {
      res.status(200).send({
        success: true,
        message: "Chats Fetched Successfully",
        chats,
      });
    }
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

export const deleteConversation = async (req, res) => {
  try {
    const { sender, receiver } = req.body;
    const { id } = req.params;

    switch (true) {
      case !id:
        throw new Error("Coversation ID is required to make a delete request");
      case !sender:
        throw new Error("Message ID is required to make a delete request");
      case !receiver:
        throw new Error("Receiver ID is required");
    }

    const convo = await ConversationModel.findByIdAndDelete({ _id: id });

    const messages = await ChatModel.deleteMany({
      $or: [
        { sender: sender, reciever: receiver },
        { sender: receiver, reciever: sender },
      ],
    });
    console.log(messages);
    if (!convo) {
      res.status(201).send({
        success: false,
        message:
          "Either The Conversation Doesn't Exist Or Has Already Been Deleted",
      });
    } else {
      res.status(200).send({
        success: true,
        message: "Coversation Has Been Deleted Successfully",
      });
    }
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "Something Went Wrong",
      error: error.message,
    });
  }
};

export const getAllMessages = async (req, res) => {
  try {
    const { sender, reciever } = req.body;

    switch (true) {
      case !sender:
        throw new Error("Sender is required");
      case !reciever:
        throw new Error("Receiver is required");
    }

    const messages = await ChatModel.find({
      $or: [
        { sender: sender, reciever: reciever },
        { sender: reciever, reciever: sender },
      ],
    }).sort({ createdAt: -1 });

    if (!messages) {
      res.send({
        message: "No Messages Found!!",
      });
    } else {
      res.status(200).send({
        success: true,
        message: "Messages Fetched Successfully",
        messages,
      });
    }
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    console.log(req.body);
    const { id } = req.params;
    const {publicId} = req.body;
    switch (true) {
      case !id:
        throw new Error("Message Id is required to make a delete request");
    }

    const message = await ChatModel.findByIdAndDelete({ _id: id });
    if(publicId){
      const deleteFromCloud = await cloudinary.uploader.destroy(publicId, (error, result) => {
        if(result){
          console.log(result);
        } else{
          console.log(error);
        }
      });
    }
    if (!message) {
      res.status(201).send({
        success: false,
        message: "Either the message doesn't Exist Or Has Already Been Deleted",
      });
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
      error: error.message,
    });
  }
};

export const setMessagesAsRead = async (req, res) => {
  console.log(req.params);
  try {
    const { id } = req.params;
    const { lastMessage } = req.body;
    switch (true) {
      case !id:
        throw new Error("No Status Updated Found from Client");
    }

    const chat = await ConversationModel.findById({ _id: id });
      if (chat.read === true) {
       res.status(201).send({
          success: false,
          message: "Already Seen"
        })
      } else {
        await chat.updateOne(
          { read: true, $set: { chat: { ...lastMessage } } },
          { new: true }
        );
        res.status(200).send({
          success: true,
          message: "Message Marked Read",
        });
      }
    
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Something Went Wrong",
    });
  }
};

export const markMessageAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    switch (true) {
      case !id:
        throw new Error("Id  is required");
    }

    const isRead = await ConversationModel.findById({ _id: id });
    res.status(200).send({
      success: true,
      isRead: isRead.read,
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      error: error.message,
    });
  }
};
