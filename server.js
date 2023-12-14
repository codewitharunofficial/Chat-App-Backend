import express from 'express';
import cors from 'cors';
import connectToDB from './config/db.js';
import dotenv from 'dotenv';
import MessageRoutes from './Routes/MessageRoutes.js';
import userRoutes from './Routes/UserRoutes.js';
import formidableMiddleware from 'express-formidable';

dotenv.config();

//database config
connectToDB();

//App

const app = express();
const port = process.env.PORT || 6969
app.use(cors());
app.use(express.json());
app.use(formidableMiddleware({
    encoding: 'utf-8',
    uploadDir: 'static/files',
    multiples: true
}));


app.use('/api/v1/messages', MessageRoutes);
app.use('/api/v1/users', userRoutes);



app.listen(port, (req, res)=> {
    console.log(`Server is Running at http://localhost:${port}`);
});