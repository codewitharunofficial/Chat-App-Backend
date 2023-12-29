import express from 'express';
import { deleteUser, fetchAllUsers, forgotPassword, getUser, getUserPhoto, loginUser, newUser, searchUser, updateUser } from '../Controllers/UserController.js';
import ExpressFormidable from 'express-formidable';
import { requireSignIn } from '../MiddleWares/IsActive.js';
import { ForgotPasswordValidator, signUpValidator } from '../Helpers/validators.js';


const router = express.Router();

//image




//Post New Messange Or Send New Message

router.post('/create-user', signUpValidator, newUser);

//Login User

router.post('/login', loginUser);

router.get('/fetch-users', requireSignIn, fetchAllUsers);

router.get('/get-user/:id', getUser);

router.get('/search-user/:keyword', searchUser);

router.get('/get-photo/:id', getUserPhoto);

router.put('/update-user/:id', updateUser);

router.delete('/delete-account/:id', deleteUser);

router.put('/reset-password', ForgotPasswordValidator, forgotPassword);




export default router