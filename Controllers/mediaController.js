import userModel from "../Models/userModel.js";
import cloudinary from "../Helpers/cloudinary.js";





export const uploadProfilePicture = async (req, res) => {

       try {

        const result = await cloudinary.uploader.upload(req.files.profilePhoto.path, {
            public_id: `${req.params.id}_profile`,
         });
    

    switch(true){
        case !result: throw new Error("Photo Is Required");
    }

    const user = await userModel.findByIdAndUpdate(req.params.id, {profilePhoto: result});

    await user.save();
    

    res.status(200).send({
        success: true,
        message: "Photo Uploaded Successfully",
        user
    });
       

   } catch (error) {
    console.log(error)
       res.status(400).send({
        success:  false,
        message: "Error while uploading photo",
        error: error.message
       })
   }
}