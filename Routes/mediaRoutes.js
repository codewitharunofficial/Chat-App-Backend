import express from 'express';
import ExpressFormidable from 'express-formidable';
import { uploadProfilePicture } from '../Controllers/mediaController.js';
// import multer from 'multer';
// import formidable from 'express-formidable';


const router = express.Router();

router.use(ExpressFormidable());

// const storage = multer.memoryStorage();

// const fileFilter = (req, file, cb) => {
//     if(file.mimetype.startsWith('image')){
//         cb(null, true)
//     } else {
//         cb('invalid image file', false);
//     }
// };

// const uploads = multer({
//     dest: storage,
//     storage: storage,
//     fileFilter
// });
//For User's Profile Pic

router.post('/upload/:id', ExpressFormidable() , uploadProfilePicture);



export default router;