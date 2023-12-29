import { comparePassword, hashPassword } from "../Helpers/authHelper.js";
import userModel from "../Models/userModel.js";
import ConversationModel from '../Models/ConversationModel.js';
import JWT from "jsonwebtoken";
import {validationResult } from "express-validator";

export const newUser = async (req, res) => {
  const { name, phone, email, password, answer } = req.body;

  try {
    if (!name) {
      return res.send({ message: "Name Is Required" });
    }
    if (!phone) {
      res.send({ message: "Phone Is Required" });
    }
    if (!email) {
      res.send({ message: "Email Is Required" });
       
    }
    if (!password) {
      return res.send({
        message:
          "Password is Required & Should be of atleast 6 characters and Should contain atleast 1 Uppercase, 1 lowercase, 1 special character & 1 number",
      });
    }
    if (!answer) {
      return res.send({ message: "Answer Is Required for Security Purpose" });
    }

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(401).send({
        success: false,
        error: errors.array(),
      });
    } else {
      const existingUser = await userModel.findOne({ phone });

      if (existingUser) {
        return res.status(200).send({
          error: "The Provided Phone No. Is Already Registered",
        });
      } else {
        const hanshedPassword = await hashPassword(password);

        const user = new userModel({ ...req.body, password: hanshedPassword });

        // if(profilePhoto) {
        //     user.profilePhoto.data = fs.readFileSync(profilePhoto.path);
        //     user.profilePhoto.contentType = profilePhoto.type;
        // }

        const token = JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
          expiresIn: "7d",
        });

        await user.save();

        res.status(200).send({
          success: true,
          message: "Registration Successfull",
          user,
          token,
        });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Something Went Wrong",
      error: error.message,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { phone, password } = req.body;

    switch (true) {
      case !phone:
        throw new Error("Phone Is Required");
      case !password:
        throw new Error("Password Is Required");
    }

    const user = await userModel.findOne({ phone });

    if (!user) {
      return res.status(200).send({
        success: false,
        message: "Phone No. Isn't Registered, SignUp to get Started",
      });
    }

    const match = await comparePassword(password, user.password);

    if (!match) {
      return res.status(200).send({
        success: false,
        message: "Invalid Password",
      });
    }

    const token = JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const isOnline = await userModel.findOneAndUpdate({phone}, {Is_Online: true}, {new: true});

    res.status(200).send({
      success: true,
      message: `Welcome ${user.name}`,
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        photo: user.profilePhoto,
        isOnline: isOnline.Is_Online,
      },
      token,
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "Something Went Wrong!",
      error: error.message,
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { phone, answer, password } = req.body;

    if (!answer) {
      return res.send({
        message: "Answer is Required",
      });
    }

    if (!phone) {
      return res.send({
        message: "Phone No. is Required",
      });
    }

    if (!password) {
      return res.send({
        message: "Password is Required",
      });
    }

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.send({
        error: errors.array()
      });
    } else {
      const hanshedPassword = await hashPassword(password);

      const user = await userModel.findOne(
        { phone: phone, answer: answer },
      );

      if (!user) {
        res.status(201).send({
          success: false,
          message: "Phone Or Answer Mismatched, please try again",
        });
      } else {
        const updatedUser = await userModel.findOneAndUpdate(
          { phone: phone, answer: answer },
          { password: hanshedPassword },
          { new: true }
        );
        await updatedUser.save();

        res.status(200).send({
          success: true,
          message: "Password Reset Successfully",
          updatedUser,
        });
        console.log(updatedUser);
      }
    }
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Something Went Wrong!",
      error: error.message,
    });
  }
};

export const fetchAllUsers = async (req, res) => {
  try {
    const users = await userModel
      .find({})
      .select(["-profilePhoto", "-password"])
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      message: "Users Fetching Successfull",
      users,
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

export const getUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new Error("ID is required");
    }

    const user = await userModel.findOne({ _id: id });
    res.status(200).send({
      success: true,
      message: "Fetching User Succcessfull",
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

export const searchUser = async (req, res) => {
  try {
    const { keyword } = req.params;
    const searchedResults = await userModel.find({
      $or: [
        { name: { $regex: keyword, $options: "i" } },
        { phone: { $regex: keyword, $options: "i" } },
      ],
    });

    res.status(200).send({
      success: true,
      message: "User Found",
      searchedResults,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error While Searching User",
      error,
    });
  }
};

export const getUserPhoto = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await userModel.findOne({ _id: id });
    if (!user) {
      res.status(400).send({
        success: false,
        message: "No user found",
      });
    } else {
      const photo = await userModel
        .findOne({ _id: id })
        .select(["profilePhoto"]);
      res.status(200).send({
        success: true,
        message: "User's Photo Fetched Successfully",
        photo: photo.profilePhoto.secure_url,
      });
    }
  } catch (error) {}
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email } = req.body;

    switch (true) {
      case !name:
        throw new Error("Name Can't Be Empty");
      case !phone:
        throw new Error("Phone Can't Be Empty");
      case !email:
        throw new Error("Email Can't Be Empty");
    }

    const user = await userModel.findByIdAndUpdate(
      { _id: id },
      { name: name, phone: phone, email: email },
      { new: true }
    );

    await user.save();

    const updatedUserIfSender = await ConversationModel.updateMany({senderId: id}, {sender: user});
    const updateUserIfReciever = await ConversationModel.updateMany({receiverId: id}, {receiver: user}, {new: true});

    res.status(200).send({
      success: true,
      message: "User Updated Successfully",
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

export const deleteUser = async (req, res) => {
  try {
    const { phone } = req.body;
    const { id } = req.params;

    if (!id) {
      return res.send({
        message: "No User ID Found In the request",
      });
    }

    if (!phone) {
      return res.send({
        message: "Phone is Required to make a user deleletion request",
      });
    } else {
      const user = await userModel.findOneAndDelete({
        $and: [{ _id: id }, { phone: phone }],
      });
      if (!user) {
        res.status(400).send({
          success: false,
          message: "Please Type The Correct Phone No.",
        });
      } else {
        res.status(200).send({
          success: true,
          message: "Account Deleted Successfully, Hope We see again soon",
        });
      }
    }
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "Something Went Wrong!",
    });
  }
};
