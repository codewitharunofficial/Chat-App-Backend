import StatusModel from "../Models/StatusModel.js";
import cloudinary from "../Helpers/cloudinary.js";
import userModel from "../Models/userModel.js";

export const uploadStatus = async (req, res) => {
    try {
        const {id} = req.params;
        const {status} = req.files;

        switch(true){
            case !id: throw new Error("User is required");
            case !status: throw new Error("File is required");
        }

        const user = await userModel.findById({_id: id});

        if(!user){
            return res.status(400).send({
                success: false,
                message: "No User Provided"
            })
        } else {

            const results = await cloudinary.uploader.upload(status.path, {
                public_id: `${id}_${Math.floor(Math.random() * 9000 + 1000)}_status`,
                resource_type: status?.type === "image/jpg" ? "image" : "video"
            });

            

            if(results){
                const story = new StatusModel({author: user, status: results, authorId: id, type: status.type === "image/jpg" ? "Image" : "Video" });
                await story.save();
                res.status(200).send({
                    success: true,
                    message: "Status Updated Successfully",
                    story
                });
            }
        }

        
    } catch (error) {
        console.log(error);
        res.status(400).send({
            success: false,
            message: "Something Went Wrong",
        })
    }
}

export const fetchStatus = async (req, res) => {
    try {
        const {id} = req.params;

        switch(true){
            case !id: throw new Error("No User Provided")
        }

        const currentTime = Date.now();
        const expiredStatus = await StatusModel.deleteMany({expiresAt: {$lt : currentTime}});

        const myStatus = await StatusModel.find({authorId: id});


        if(myStatus.length < 1){
            return res.status(400).send({
                success: false,
                message: "No Status Found"
            })
        } else {
            res.status(200).send({
                success: true, 
                message: "Status Fetched Successfully",
                myStatus
            })
        }
    } catch (error) {
        res.status(400).send({
            success: false,
            message: "Something Went Wrong"
        })
    }
}

export const fetchAllStatus = async (req, res) => {
    try {
        const status = await StatusModel.find({});
        if(!status){
            return res.status(400).send({
                success: false,
                message: "No status Found"
            })
        } else {
            res.status(200).send({
                success: true,
                message: "Status Fetched Successfully"
            })
        }
    } catch (error) {
        res.status(400).send({
            success: false,
            message: "Something Went Wrong"
        })
    }
}