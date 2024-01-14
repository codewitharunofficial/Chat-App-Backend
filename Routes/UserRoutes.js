import express from 'express';
import { blockAUser, deleteUser, fetchAllUsers, findUsers, forgotPassword, generateNewOTP, getUser, getUserPhoto, loginUser, newUser, requestOtpForResetPassword, searchUser, unblockUser, updateUser, verifyOTP } from '../Controllers/UserController.js';
import ExpressFormidable from 'express-formidable';
import { requireSignIn } from '../MiddleWares/IsActive.js';
import { ForgotPasswordValidator, signUpValidator } from '../Helpers/validators.js';


const router = express.Router();

//image




//Post New Messange Or Send New Message

router.post('/create-user', signUpValidator, newUser);

//verify email otp

router.post('/verify-otp', verifyOTP);

//generate new otp
router.post('/request-otp', generateNewOTP);

//otp via sms


//Login User

router.post('/login', loginUser);

router.get('/fetch-users', requireSignIn, fetchAllUsers);

router.get('/get-user/:id', getUser);

router.get('/search-user/:keyword', searchUser);

router.get('/get-photo/:id', getUserPhoto);

router.get('/user-auth', requireSignIn, (req, res) => {
    res.status(200).send({ok: true});
})

router.put('/update-user/:id', updateUser);

router.delete('/delete-account/:id', deleteUser);

router.put('/reset-password-request', requestOtpForResetPassword);

router.put('/reset-password', ForgotPasswordValidator, forgotPassword);

router.post('/block-user/:id', blockAUser);

router.post('/unblock-user/:id', unblockUser);

router.post('/find-user', findUsers);




export default router