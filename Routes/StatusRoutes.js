import express from 'express';
import ExpressFormidable from 'express-formidable';
import { fetchAllStatus, fetchStatus, uploadStatus } from '../Controllers/StatusController.js';

const router = express.Router();
router.use(ExpressFormidable());
router.use(express.urlencoded({
    extended: true
}));


router.post('/upload-status/:id', ExpressFormidable(), uploadStatus);
router.get('/get-status/:id', fetchStatus);
router.get('/get-all-status', fetchAllStatus);



export default router;