import express from 'express';
import cors from 'cors';
import connectToDB from './config/db.js';
import dotenv from 'dotenv';
import MessageRoutes from './Routes/MessageRoutes.js';
import userRoutes from './Routes/UserRoutes.js';
import mediaRoutes from './Routes/mediaRoutes.js';
import http from 'http';
import {Server} from 'socket.io';
// import formidableMiddleware from 'express-formidable';

dotenv.config();


//database config
connectToDB();

//App

const app = express();
const port = process.env.PORT || 6969

const server = http.createServer(app);

const io = new Server(server);


io.on('connection', (socket) => {
    console.log('User Connected' + socket.id);

    io.on('disconnect', (socket) => {
        console.log("User Disconnected" + " " + socket.id);
    })
    
})

app.use(cors());
app.use(express.json());
// app.use(formidableMiddleware());
app.use(express.urlencoded({
    extended: true
}));

app.use((req, res, next) => {
    req.io = io;
    return next();
  });


app.use('/api/v1/messages', MessageRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/media', mediaRoutes);



server.listen(port, (req, res)=> {
    console.log(`Server is Running at http://localhost:${port}`);
});