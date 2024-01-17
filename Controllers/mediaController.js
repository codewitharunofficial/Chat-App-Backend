import userModel from "../Models/userModel.js";
import cloudinary from "../Helpers/cloudinary.js";
import ConversationModel from "../Models/ConversationModel.js";
import ChatAttachmentModel from "../Models/ChatAttachmentsModel.js";
import path from "path";
import ChatModel from "../Models/ChatModel.js";
import ChatAttachmentsModel from "../Models/ChatAttachmentsModel.js";
export const uploadProfilePicture = async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(
      req.files.profilePhoto.path,
      {
        public_id: `${req.params.id}_profile`,
      }
    );

    switch (true) {
      case !result:
        throw new Error("Photo Is Required");
    }

    const user = await userModel.findByIdAndUpdate(
      req.params.id,
      {
        profilePhoto: result,
      },
      { new: true }
    );

    await user.save();

    const updatedPhotoIfSender = await ConversationModel.updateMany(
      { senderId: req.params.id },
      { sender: user },
      { new: true }
    );

    const updatePhotoIfReciever = await ConversationModel.updateMany(
      { receiverId: req.params.id },
      { receiver: user },
      { new: true }
    );
    res.status(200).send({
      success: true,
      message: "Photo Uploaded Successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error while uploading photo",
      error: error.message,
    });
  }
};

export const deleteProfilePhoto = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.send({
        message: "User Id is required to delete profile photo",
      });
    }

    const user = await userModel.findByIdAndUpdate(
      { _id: id },
      { $unset: { profilePhoto: "" } },
      { new: true }
    );
    res.status(200).send({
      success: true,
      message: "Photo Deleted Successfully",
      user,
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "Something Went Wrong",
      error: error.message,
    });
  }
};

export const sendPhoto = async (req, res) => {
  try {
    const { sender, reciever } = req.fields;
    const { photo } = req.files;

    switch (true) {
      case !sender:
        throw new Error("Sender is required");
      case !reciever:
        throw new Error("Reciever is required");
      case !photo:
        throw new Error("Photo is required");
    }

    const result = await cloudinary.uploader.upload(photo.path, {
      public_id: `${sender}_image`,
    });

    switch (true) {
      case !result:
        throw new Error("Photo is required");
    }

    const attachmentImage = new ChatAttachmentModel({
      image: result,
      senderId: sender,
      recieverId: reciever
    }).save();

    const imageMessage = new ChatModel({
      sender: sender,
      reciever: reciever,
      message: result,
    });

    await imageMessage.save();

    if(imageMessage){
      const messages = await ChatModel.find({
        $or: [
          { sender: sender, reciever: reciever },
          { sender: reciever, reciever: sender },
        ],
      }).sort({ createdAt: -1 });
      const chat = await ConversationModel.findOneAndUpdate(
        {
          $or: [
            { senderId: sender, receiverId: reciever },
            { senderId: reciever, receiverId: sender },
          ],
        },
        { chat: messages[0] },
        { new: true }
      );
    }

    res.status(200).send({
      success: true,
      message: "Attachment Sent Successfully",
      messages,
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "Something went Wrong",
      error: error.message,
    });
  }
};

export const sendVoiceMessage = async (req, res) => {
  // console.log(req.fields, req.files);
  try {
    const { sender, receiver } = req.fields;
    const { audio } = req.files;

    switch (true) {
      case !sender:
        throw new Error("Sender Is  required");
      case !receiver:
        throw new Error("Receiver Is  required");
      case !audio:
        throw new Error("No Audio Found");
    }

    const result = await cloudinary.uploader.upload(audio.path, {
      public_id: `${sender}_voice`,
      resource_type: "auto",
    });

    const voice = new ChatAttachmentModel({
      senderId: sender,
      recieverId: receiver,
      audio: result,
    }).save();

    const voiceMessage = new ChatModel({
      sender: sender,
      reciever: receiver,
      message: result,
    });

    await voiceMessage.save();

    if (voiceMessage) {
      const messages = await ChatModel.find({
        $or: [
          { sender: sender, reciever: receiver },
          { sender: receiver, reciever: sender },
        ],
      }).sort({ createdAt: -1 });

      const chat = await ConversationModel.findOneAndUpdate(
        {
          $or: [
            { senderId: sender, receiverId: receiver },
            { senderId: receiver, receiverId: sender },
          ],
        },
        { chat: messages[0] },
        { new: true }
      );
    }

    res.status(200).send({
      success: true,
      message: "Voice Message Sent Successfully",
      voiceMessage,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Something Went Wrong",
      error: error.message,
    });
  }
};

//fetch all attachments send to a perticular chat

export const getAttachments = async (req, res) => {
  console.log(req.fields);
  try {
    const { sender, reciever } = req.fields;

    switch (true) {
      case !sender:
        throw new Error("Sender Is Required");
      case !reciever:
        throw new Error("Reciever Is Required");
    }

    const attachments = await ChatAttachmentsModel.find({
      $or: [
        { senderId: sender, recieverId: reciever },
        { senderId: reciever, recieverId: sender },
      ],
    });

    if (!attachments) {
      res.status(201).send({
        success: false,
        message: "No Attachments Found",
      });
    } else {
      res.status(200).send({
        success: true,
        message: "Attchments fechted successfully",
        attachments,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(200).send({
      success: false,
      message: "Something Went Wrong",
      error,
    });
  }
};
