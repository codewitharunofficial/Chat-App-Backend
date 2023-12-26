import express from 'express';
import { fetchAllUsers, getUser, getUserPhoto, loginUser, newUser, searchUser, updateUser } from '../Controllers/UserController.js';
import ExpressFormidable from 'express-formidable';
import { requireSignIn } from '../MiddleWares/IsActive.js';


const router = express.Router();

//image




//Post New Messange Or Send New Message

router.post('/create-user', newUser);

//Login User

router.post('/login', loginUser);

router.get('/fetch-users', requireSignIn, fetchAllUsers);

router.get('/get-user/:id', getUser);

router.get('/search-user/:keyword', searchUser);

router.get('/get-photo/:id', getUserPhoto);

router.put('/update-user/:id', updateUser);




export default router