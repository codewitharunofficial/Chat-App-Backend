import express from "express";
import cors from "cors";
import connectToDB from "./config/db.js";
import dotenv from "dotenv";
import MessageRoutes from "./Routes/MessageRoutes.js";
import userRoutes from "./Routes/UserRoutes.js";
import mediaRoutes from "./Routes/mediaRoutes.js";
import http from "http";
import { Server } from "socket.io";
// import formidableMiddleware from 'express-formidable';
import ConversationModel from "./Models/ConversationModel.js";
import ChatModel from "./Models/ChatModel.js";
import userModel from "./Models/userModel.js";
import StatusRoutes from './Routes/StatusRoutes.js';

dotenv.config();

//database config
connectToDB();

//App

const app = express();
const port = process.env.PORT || 6969;

const server = http.createServer(app);

const io = new Server(server);

io.on("connection", (socket) => {
  socket.on("connected", async (data) => {
    try {
      const isOnline = await userModel.findByIdAndUpdate(
        { _id: data },
        { Is_Online: "true" },
        { new: true }
      );
      console.log(`${isOnline.name} is Online`);
      socket.emit("online-status", { isOnline });

      const updateSender = await ConversationModel.updateMany(
        { senderId: data },
        { sender: isOnline },
        { new: true }
      );
      const updateReceiver = await ConversationModel.updateMany(
        { receiverId: data },
        { receiver: isOnline },
        { new: true }
      );
      // console.log(updateSender, updateReceiver);
      socket.on("disconnect", async () => {
        const isOffline = await userModel.findByIdAndUpdate(
          { _id: data },
          { Is_Online: "false" , lastseen: Date.now()},
          { new: true }
        );
        console.log(`${isOffline.name} is Offline`);
        const updateSender = await ConversationModel.updateMany(
          { senderId: data },
          { sender: isOffline },
          { new: true }
        );
        const updateReceiver = await ConversationModel.updateMany(
          { receiverId: data },
          { receiver: isOffline },
          { new: true }
        );
        // console.log(updateReceiver, updateSender);
      });
    } catch (error) {
      console.log(error.message);
    }
  });

  socket.on("log-out", async (data) => {
    // console.log(data);
    const isOffline = await userModel.findByIdAndUpdate(
      { _id: data },
      { Is_Online: "false", lastseen: Date.now() },
      {new: true}
    );
    const updateSender = await ConversationModel.updateMany(
      { senderId: data },
      { sender: isOffline },
      {new: true}
    );
    const updateReceiver = await ConversationModel.updateMany(
      { receiverId: data },
      { receiver: isOffline },
      {new: true}
    );
  });

  socket.on("send-message", async (data) => {
    // console.log("Recieved a message in server side", data);

    const sender = await userModel.findById({ _id: data.sender });
    const reciever = await userModel.findById({ _id: data.reciever });

    const newMessage = new ChatModel({
      sender: data.sender,
      reciever: data.reciever,
      message: data,
      from: sender,
      to: reciever,
    });

    await newMessage.save();
    const messages = await ChatModel.find({
      $or: [
        { sender: data.sender, reciever: data.reciever },
        { sender: data.reciever, reciever: data.sender },
      ],
    }).sort({ createdAt: -1 });

    const chat = await ConversationModel.updateOne(
      { _id: data.convoId },
      {
        $push: { chat: newMessage },
        $set: {
          read: false,
          senderId: data.sender,
          receiverId: data.reciever,
          sender: sender,
          receiver: reciever,
        },
      },
      { new: true }
    ).sort({ createdAt: -1 });

    io.emit("recieved-message", { newMessage, messages });

    io.on("update-status", async(status) => {
      console.log(status);
    })
  });
});

app.use(
  cors({
    origin: "*",
    methods: ["POST", "GET", "PUT", "DELETE"],
    credentials: true,
    maxAge: 3600,
  })
);
app.use(express.json());

app.use("/api/v1/messages", MessageRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/media", mediaRoutes);
app.use("/api/v1/status", StatusRoutes);


server.listen(port, (req, res) => {
  console.log(`Server is Running at http://localhost:${port}`);
});
