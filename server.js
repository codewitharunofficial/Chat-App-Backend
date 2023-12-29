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

dotenv.config();

//database config
connectToDB();

//App

const app = express();
const port = process.env.PORT || 6969;

const server = http.createServer(app);

const io = new Server(server);

io.on("connection", (socket) => {
  socket.on('connected', async (data)=> {
    try {
      const isOnline = await userModel.findByIdAndUpdate({_id: data}, {Is_Online: true}, {new: true});

      console.log(`${isOnline.name} is ${isOnline.Is_Online}`);
    } catch (error) {
      console.log(error);
    }
  })

  socket.on("send-message", async (data) => {
    console.log("Recieved a message in server side", data);
    const newMessage = new ChatModel({
      sender: data.sender,
      reciever: data.reciever,
      message: data.message,
    });
    await newMessage.save();
    const messages = await ChatModel.find({
      $or: [
        { sender: data.sender, reciever: data.reciever },
        { sender: data.reciever, reciever: data.sender },
      ],
    }).sort({ createdAt: -1 });
    
    const chat = await ConversationModel.findByIdAndUpdate(
      { _id: data.convoId },
      { chat: newMessage },
      { new: true }
    ).sort({ createdAt: -1 });
    await chat.save();

    io.emit("recieved-message", { newMessage, messages, });
  });

  io.on("disconnect", (socket) => {
    console.log("User Disconnected");
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

server.listen(port, (req, res) => {
  console.log(`Server is Running at http://localhost:${port}`);
});
