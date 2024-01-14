import {
  compareOTP,
  comparePassword,
  hashOTP,
  hashPassword,
} from "../Helpers/authHelper.js";
import userModel from "../Models/userModel.js";
import ConversationModel from "../Models/ConversationModel.js";
import JWT from "jsonwebtoken";
import { validationResult } from "express-validator";
import nodemailer from "nodemailer";
import OTPVerificationModel from "../Models/OTPVerificationModel.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "chatrrislive@gmail.com",
    pass: "cobojbqyrlloofec",
  },
});

export const verifyOTP = async (req, res) => {
  console.log(req.body);
  try {
    const { otp, email } = req.body;
    if (!otp) {
      res.send({
        success: false,
        message: "Please Provide a valid OTP",
      });
      if (!email) {
        res.send({
          success: false,
          message: "Please Provide a valid Email",
        });
      }
    } else {
      const OTP = await OTPVerificationModel.findOne({ email });
      if (!OTP) {
        res.status(400).send({
          success: false,
          message: "Invalid Email",
        });
      }

      const verify = await compareOTP(otp, OTP.OTP);
      if (!verify) {
        res.status(400).send({
          success: false,
          message: "Incorrect OTP",
        });
      } else {
        const timeNow = Date.now();

        if (timeNow > OTP.expiresAt) {
          await OTPVerificationModel.findOneAndDelete({ email });
          res.status(400).send({
            success: false,
            message: "OTP Has Expired, Kindly Request New OTP",
          });
        } else {
          await OTPVerificationModel.findOneAndDelete({ email });
          const user = await userModel.findOneAndUpdate(
            { email: email },
            { emailStatus: "Verified" },
            { new: true }
          );
        }
        res.status(200).send({
          success: true,
          message: "OTP Verification Successfull",
        });
      }
    }
  } catch (error) {
    console.log(error);
  }
};

export const generateNewOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const OTP = Math.floor(1000 + Math.random() * 9000).toString();

    const hashedOTP = await hashOTP(OTP);

    const mailOptions = {
      from: "Chattr",
      to: email,
      subject: "Account Verification",
      text: `New OTP for your Chatrr Account Verification is ${OTP}`,
    };

    transporter.sendMail(mailOptions, async (error, info) => {
      if (error) {
        return console.error(error.message);
      }
      console.log("Email sent :", info.response);

      const otpInDb = new OTPVerificationModel({
        email: email,
        OTP: hashedOTP,
      }).save();
      res.status(200).send({
        success: true,
        message: "New OTP Sent Successfully",
      });
    });
  } catch (error) {}
};

export const newUser = async (req, res) => {
  const { name, phone, email, password } = req.body;

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

        const OTP = Math.floor(1000 + Math.random() * 9000).toString();

        const hashedOTP = await hashOTP(OTP);

        const mailOptions = {
          from: "Chattr",
          to: email,
          subject: "Account Verification",
          text: `
          Welcome ${name},
          The New World For Chatrrs..!! \n
          OTP for your Chatrr Account Verification is
           ${OTP}.
          The OTP Is Valid For 1 Minute.
          Please Verify OTP To Become Our Certified
          Chatrr
          `,
        };

        transporter.sendMail(mailOptions, async (error, info) => {
          if (error) {
            return console.error(error.message);
          }
          console.log("Email sent :", info.response);

          const otpInDb = new OTPVerificationModel({
            email: email,
            OTP: hashedOTP,
          }).save();

          const user = new userModel({
            ...req.body,
            password: hanshedPassword,
          });
          const token = JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
          });

          await user.save();
          res.status(200).send({
            success: true,
            message: `An OTP Has Been Sent To ${email}, Enter The OTP To Verify & Finish Signing Up`,
            user,
            token,
          });
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

    const isOnline = await userModel.findOneAndUpdate(
      { phone },
      { Is_Online: true },
      { new: true }
    );

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
        blocked_users: user?.blocked_users
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

export const requestOtpForResetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.send({
        message: "Email No. is Required",
      });
    }

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.send({
        error: errors.array(),
      });
    } else {
      const OTP = Math.floor(1000 + Math.random() * 9000).toString();

      const hashedOTP = await hashOTP(OTP);

      const mailOptions = {
        from: "Chattr",
        to: email,
        subject: "Account Verification",
        text: `OTP for Resetting your Chatrr Account Password is ${OTP}`,
      };

      transporter.sendMail(mailOptions, async (error, info) => {
        if (error) {
          return console.error(error.message);
        }
        console.log("Email sent :", info.response);

        const otpInDb = new OTPVerificationModel({
          email: email,
          OTP: hashedOTP,
        }).save();
        res.status(200).send({
          success: true,
          message: "OTP Sent Successfully",
        });
      });
    }
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "Something went Wrong",
      error,
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    if (!email) {
      return res.send({
        message: "OTP No. is Required",
      });
    }

    if (!otp) {
      return res.send({
        message: "OTP No. is Required",
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
        error: errors.array(),
      });
    } else {
      const hanshedPassword = await hashPassword(password);

      const user = await userModel.findOne({ email });

      if (!user) {
        res.status(201).send({
          success: false,
          message: "Phone Or Answer Mismatched, please try again",
        });
      } else {
        const updatedUser = await userModel
          .findOneAndUpdate(
            { email },
            { password: hanshedPassword },
            { new: true }
          )
          .select("-password");
        await updatedUser.save();
        const otpIndb = await OTPVerificationModel.findOneAndDelete({ email });
        const mailOptions = {
          from: "Chattr",
          to: email,
          subject: "Account Verification",
          text: `Hi, Your Password Has Been Changed Successfully.
          Your Details are ${updatedUser}`,
        };

        transporter.sendMail(mailOptions, async (error, info) => {
          if (error) {
            return console.error(error.message);
          }
          console.log("Email sent :", info.response);
        });

        res.status(200).send({
          success: true,
          message: "Password Reset Successfully",
          updatedUser,
        });
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

    const updatedUserIfSender = await ConversationModel.updateMany(
      { senderId: id },
      { sender: user }
    );
    const updateUserIfReciever = await ConversationModel.updateMany(
      { receiverId: id },
      { receiver: user },
      { new: true }
    );

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

export const blockAUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req.body;
    if (!user) {
      return res.status(400).send({
        success: false,
        message: "ID of the user to be blocked is required",
      });
    }
    const userToBeBlocked = await userModel.findById({ _id: user });
    const userToBeUpdated = await userModel.findById({ _id: id });
    if (!userToBeUpdated) {
      return res.status(401).send({
        success: false,
        message: "No User Found",
      });
    } else {
      if (userToBeUpdated.blocked_users.includes(user)) {
        return (
          true,
          res.status(201).send({
            success: false,
            message: "User Is Already Blocked",
          })
        );
      } else {
        
         const updatedUser =  await userModel.findByIdAndUpdate(
            { _id: id },
            { $push: { blocked_users: userToBeBlocked._id }}, {new: true}
          );
          const updatedUserIfSender = await ConversationModel.updateMany(
            { senderId: id },
            { sender: updatedUser },
            {new: true}
          );
          const updateUserIfReciever = await ConversationModel.updateMany(
            { receiverId: id },
            { receiver: updatedUser },
            { new: true }
          );
          res.status(200).send({
            success: true,
            message: "User Blocked Successfully",
            updatedUser,
          });
      }
    }
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};


//unblocking a user

export const unblockUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req.body;
    if (!user) {
      return res.status(400).send({
        success: false,
        message: "ID of the user to be UnBlocked is required",
      });
    }
    const userToBeUnBlocked = await userModel.findById({ _id: user });
    const userToBeUpdated = await userModel.findById({ _id: id });
    if (!userToBeUpdated) {
      return res.status(401).send({
        success: false,
        message: "No User Found",
      });
    } else {
      if (!userToBeUpdated.blocked_users.includes(user)) {
        return (
          true,
          res.status(201).send({
            success: false,
            message: "User Is Not In the Blocklist",
          })
        );
      } else {
        
         const updatedUser =  await userModel.findByIdAndUpdate(
            { _id: id },
            { $pull: { blocked_users: userToBeUnBlocked._id }}, {new: true}
          );
          const updatedUserIfSender = await ConversationModel.updateMany(
            { senderId: id },
            { sender: updatedUser },
            {new: true}
          );
          const updateUserIfReciever = await ConversationModel.updateMany(
            { receiverId: id },
            { receiver: updatedUser },
            { new: true }
          );
          res.status(200).send({
            success: true,
            message: "UnBlocked User Successfully",
            updatedUser,
          });
      }
    }
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
}

export const findUsers = async (req, res) => {
  try {
    // console.log(req.body);
    const {id} = req.body;
    console.log(id);
  if(!id) {
    return res.status(201).send({
      success: false,
      message: "Id is required"
    })
  } else {
    for(let i=0; i<= id.length; i++) {
      console.log(i);
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
