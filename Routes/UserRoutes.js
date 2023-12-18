import express from 'express';
import { fetchAllUsers, getUser, loginUser, newUser } from '../Controllers/UserController.js';
import ExpressFormidable from 'express-formidable';


const router = express.Router();

//image




//Post New Messange Or Send New Message

router.post('/create-user', newUser);

//Login User

router.post('/login', loginUser);

router.get('/fetch-users', fetchAllUsers);

router.get('/get-user/:id', getUser);






export default router