import StatusModel from "../Models/StatusModel.js";
import cloudinary from "../Helpers/cloudinary.js";
import userModel from "../Models/userModel.js";
import UserStoriesModel from "../Models/UserStoriesModel.js";

export const uploadStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.files;

    switch (true) {
      case !id:
        throw new Error("User is required");
      case !status:
        throw new Error("File is required");
    }

    const user = await userModel.findById({ _id: id });

    if (!user) {
      return res.status(400).send({
        success: false,
        message: "No User Provided",
      });
    } else {
      const results = await cloudinary.uploader.upload(status.path, {
        public_id: `${id}_${Math.floor(Math.random() * 9000 + 1000)}_status`,
        resource_type:
          status?.type === "image/jpg" ||
          status.type === "image/jpeg" ||
          status.type === "image/png"
            ? "image"
            : "video",
      });

      if (!results) {
        return res.status(401).send({
          success: false,
          message: "Error from cloudinary",
        });
      } else {
        const story = new StatusModel({
          author: user,
          status: results,
          authorId: id,
          type:
            status.type === "image/jpg" ||
            status.type === "image/jpeg" ||
            status.type === "image/png"
              ? "Image"
              : "Video",
        });
        await story.save();
        const userStories = await UserStoriesModel.find({ authorId: id });
        if (userStories.length < 1) {
          const stories = new UserStoriesModel({
            authorId: id,
            author: user,
            stories: story,
            length: 1,
          }).save();
          return res.status(200).send({
            success: true,
            message: "Status Uploaded Successfully",
            stories,
          });
        } else {
          const currentTime = new Date();
          const currentLength = userStories[0].stories.length;
          const updatedStories = await UserStoriesModel.updateOne(
            { authorId: id },
            {
              $push: { stories: story },
              $set: {
                expiresAt: currentTime + 24 * 60 * 60 * 1000,
                length: currentLength + 1,
              },
            },
            { new: true }
          );
          return res.status(200).send({
            success: true,
            message: "Status Updated Successfully",
            updatedStories,
          });
        }
      }
    }
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Something Went Wrong",
    });
  }
};

export const fetchStatus = async (req, res) => {
  try {
    const { id } = req.params;

    switch (true) {
      case !id:
        throw new Error("No User Provided");
    }

    const currentTime = new Date();
    const expiredStatus = await StatusModel.deleteMany({
      expiresAt: { $lt: currentTime },
    });
    const updatedStories = await UserStoriesModel.updateMany(
      {},
      { $pull: { stories: { expiresAt: { $lt: currentTime } } } }
    );

    const myStatus = await StatusModel.find({ authorId: id });

    if (myStatus.length < 1) {
      return res.status(200).send({
        success: true,
        message: "No Status Found",
      });
    } else {
      res.status(200).send({
        success: true,
        message: "Status Fetched Successfully",
        myStatus,
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

export const fetchAllStatus = async (req, res) => {
  try {
    const currentTime = Date.now();
    const expiredStories = await UserStoriesModel.deleteMany({
      expiresAt: { $lt: currentTime },
    });
    const storiesWithNoStatus = await UserStoriesModel.deleteMany({
      "stories.$size": { lt: 1 },
    });
    const status = await UserStoriesModel.find({});

    if (!status) {
      return res.status(400).send({
        success: false,
        message: "No status Found",
      });
    } else {
      res.status(200).send({
        success: true,
        message: "Status Fetched Successfully",
        status,
      });
    }
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "Something Went Wrong",
    });
  }
};
