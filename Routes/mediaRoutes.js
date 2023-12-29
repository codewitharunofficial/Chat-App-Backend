import express from 'express';
import ExpressFormidable from 'express-formidable';
import { deleteProfilePhoto, sendPhoto, uploadProfilePicture } from '../Controllers/mediaController.js';
import multer from 'multer';


const router = express.Router();

router.use(ExpressFormidable());
router.use(express.urlencoded({
    extended: true
}));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


router.post('/upload/:id', ExpressFormidable() , uploadProfilePicture);

router.delete('/delete-photo/:id', deleteProfilePhoto);

router.post('/send-photo/:id', upload.single('photo'), sendPhoto);



export default router;