import ImageKit from "imagekit";
import dotenv from 'dotenv';

dotenv.config();




const ImageKit = new ImageKit({
    publicKey : IMAGE_KIT_PUBLIC_KEY,
    privateKey : IMAGE_KIT_PRIVATE_KEY,
    urlEndpoint : IMAGE_KIT_MY_URL
});

export default ImageKit;