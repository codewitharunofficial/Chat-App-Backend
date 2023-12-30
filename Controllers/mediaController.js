import userModel from "../Models/userModel.js";
import cloudinary from "../Helpers/cloudinary.js";
import ConversationModel from "../Models/ConversationModel.js";
import ChatAttachmentModel from '../Models/ChatAttachmentsModel.js';
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

    const user = await userModel.findByIdAndUpdate(req.params.id, {
      profilePhoto: result,
    }, {new: true});

    await user.save();

    const updatedPhotoIfSender = await ConversationModel.updateMany(
      { senderId: req.params.id },
      { sender: user}, {new: true}
    );

    const updatePhotoIfReciever = await ConversationModel.updateMany(
      { receiverId: req.params.id },
      { receiver: user},
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
    const { id } = req.params;
    const { photo } = req.files;

    switch(true) {
        case !id: throw new Error("Id is required");
        case !photo: throw new Error("Photo is required");
    }

    const result = await cloudinary.uploader.upload(photo.path, {
        public_id: `${id}_image`,
    });

    switch(true) {
        case !result: throw new Error("Photo is required");
    }
   
    const attachmentImage = new ChatAttachmentModel({image: result, senderId: id}).save();
    res.status(200).send({
        success: true,
        message: 'Attachment Sent Successfully',
        attachmentImage,
    });

  } catch (error) {
    res.status(400).send({
        success: false,
        message: 'Something went Wrong',
        error: error.message
    })
  }
};
