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
import StatusRoutes from "./Routes/StatusRoutes.js";
import CallModel from "./Models/CallModel.js";
import cron from "node-cron";
import axios from "axios";

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
          { Is_Online: "false", lastseen: Date.now() },
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
      { new: true }
    );
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
  });

  //sending a message

  socket.on("send-message", async (data) => {
    console.log("Recieved a message in server side", data);

    const sender = await userModel.findById({ _id: data.sender });
    const reciever = await userModel.findById({ _id: data.reciever });

    const newMessage = new ChatModel({
      sender: data.sender,
      reciever: data.reciever,
      message: data,
      from: sender,
      to: reciever,
      reply: data?.reply ? data.reply : null,
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
  });

  //replying message

  socket.on("reply-message", async (data) => {
    console.log("Recieved a message in server side", data);

    const sender = await userModel.findById({ _id: data.sender });
    const reciever = await userModel.findById({ _id: data.reciever });

    const reply = new ChatModel({
      sender: data.sender,
      reciever: data.reciever,
      message: data?.message,
      from: sender,
      to: reciever,
      isReplied: true,
      repliedBy: data?.sender,
      reply: data?.reply,
      type: data?.type,
    });

    await reply.save();

    const messages = await ChatModel.find({
      $or: [
        { sender: data.sender, reciever: data.reciever },
        { sender: data.reciever, reciever: data.sender },
      ],
    }).sort({ createdAt: -1 });

    const chat = await ConversationModel.updateOne(
      { _id: data.convoId },
      {
        $push: { chat: reply },
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

    io.emit("recieved-message", { reply, messages });
  });

  //For Calling

  socket.on("call", async ({ sender, receiver, senderPhoto, name }) => {
    const caller = await userModel.findById({ _id: sender });
    const reciever = await userModel.findById({ _id: receiver });
    const call = new CallModel({
      sender: sender,
      receiver: receiver,
      senderName: caller.name,
      receiverName: reciever.name,
      senderPhoto:
        caller?.profilePhoto?.secure_url && caller.profilePhoto.secure_url,
      receiverPhoto:
        reciever?.profilePhoto?.secure_url && reciever.profilePhoto.secure_url,
      // startTime: Date.now()
    });
    io.emit("incoming-call", {
      sender,
      receiver,
      senderPhoto,
      name,
      callId: call._id,
    });
    await call.save();
  });

  socket.on("end-call", async ({ ended, callId }) => {
    const call = await CallModel.findById(callId);
    if (call && call.startTime) {
      call.endTime = Date.now();
      call.duration = (call.endTime - call.startTime) / 1000; // Duration in seconds
      await call.save();
    }
    io.emit("end-call", { ended });
  });

  socket.on("offer", ({ offer, receiver }) => {
    io.emit("offer", { offer, receiver });
    console.log(offer, receiver);
  });

  socket.on("answer-call", async ({ peerId, answer, callId }) => {
    const call = await CallModel.findByIdAndUpdate(
      { _id: callId },
      { startTime: new Date() },
      { new: true }
    );
    io.emit("call-answered", { answer, peerId, callId });
    console.log("Call is being answered...");
  });

  socket.on("ice-candidate", (candidate) => {
    console.log("Connection is being established....");
    io.emit("ice-candidate", candidate);
    console.log("Connection established....");
  });

  //Fetching Call-Logs For A User:
  socket.on("call-logs", async ({ sender }) => {
    try {
      const calls = await CallModel.find({
        $or: [{ sender: sender }, { receiver: sender }],
      }).sort({ createdAt: -1 });
      if (calls.length === 0) {
        io.emit("call-logs", { calls: [] });
        console.log("No Call Logs Found For You");
      } else {
        io.emit("call-logs", { calls });
        console.log(calls);
      }
    } catch (error) {
      console.log(error);
    }
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

app.use("/keep-me-alive", () => {
  console.log("Server Is Alive");
});

cron.schedule("* * * * *", () => {
  axios
    .get("https://android-chatrr-app.onrender.com/keep-me-alive")
    .then((res) => {
      console.log("Server Pinged and Alive");
    })
    .catch((err) => {
      console.log("Error while pinging server", err);
    });
});

server.listen(port, (req, res) => {
  console.log(`Server is Running at http://localhost:${port}`);
});
