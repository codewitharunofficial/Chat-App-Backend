import express from 'express';
import { loginUser, newUser } from '../Controllers/UserController.js';
import multer from 'multer';
import path from 'path';
import formidable from 'express-formidable';


const router = express.Router();

//image

const storage = multer.diskStorage({
    destination: function(req, file, cb){
         cb(null, path.join(__dirname, "../static/files"));
    },
    filename: function(req, file, cb) {
        const name = Date.now() + '-' + file.originalname;
        cb(null, name)
    }
});

const upload = multer({storage: storage});


//Post New Messange Or Send New Message

router.post('/create-user', formidable(), newUser);

//Login User

router.get('/login', formidable(), loginUser);






export default router