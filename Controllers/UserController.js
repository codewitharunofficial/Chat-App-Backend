import { comparePassword, hashPassword } from "../Helpers/authHelper.js";
import userModel from "../Models/userModel.js";
import JWT from 'jsonwebtoken';
import fs from 'fs'

export const newUser = async (req, res) => {
    const {name, phone, email, password, answer} = req.body;
    console.log(req.body);
    // const {profilePhoto} = req.files;

    try {
        if(!name) {
            return res.send({message: 'Name Is Required'});
        }
        if(!phone) {
            return res.send({message: 'Phone Is Required'});
        }
        if(!email) {
            return res.send({message: 'Email Is Required'});
        }
        if(!password) {
            return res.send({message: 'Password Is Required'});
        }
        if(!answer) {
            return res.send({message: 'Answer Is Required for Security Purpose'});
        }

        const existingUser = await userModel.findOne({phone});

        if(existingUser) {
            return res.status(200).send({
                error: 'The Provided Phone No. Is Already Registered'
            })
        } else {

            const hanshedPassword = await hashPassword(password);
            
            const user =  new userModel({...req.body, password: hanshedPassword});

            // if(profilePhoto) {
            //     user.profilePhoto.data = fs.readFileSync(profilePhoto.path);
            //     user.profilePhoto.contentType = profilePhoto.type;
            // }

            const token =  JWT.sign({_id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});
            
            await user.save();
            
            res.status(200).send({
                success: true,
                message: 'Registration Successfull',
                user,
                token
            })
        }

    } catch (error) {
        console.log(error)
        res.status(400).send({
            success: false,
            message: "Something Went Wrong",
            error: error.message
            
        })
    }
}

export const loginUser = async (req, res) => {
    try {
        
        const {phone, password} = req.body;

        switch(true) {
            case !phone: throw new Error("Phone Is Required");
            case !password: throw new Error("Password Is Required");
        }

        const user = await userModel.findOne({phone});

        if(!user){
            return res.status(200).send({
                success: false,
                message: "Phone No. Isn't Registered, SignUp to get Started"
            })
        }

        const match = await comparePassword(password, user.password);

        if(!match) {
            return res.status(200).send({
                success: false,
                message: "Invalid Password"
            });
        }

        const token =  JWT.sign({_id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});

        res.status(200).send({
            success: true,
            message: `Welcome ${user.name}`,
            user: {
                _id: user._id,
                name: user.name,
                phone: user.phone,
                email: user.email,
                photo: user.profilePhoto,
            },
            token
        });

    } catch (error) {
        res.status(400).send({
            success: false,
            message: 'Something Went Wrong!',
            error: error.message
        });
    }
}


export const fetchAllUsers = async (req, res) => {
    try {
        

        const users = await userModel.find({}).select(["-profilePhoto", "-password"]).sort({createdAt : -1});
        res.status(200).send({
            success: true,
            message: 'Users Fetching Successfull',
            users
        })

    } catch (error) {
        res.status(400).send({
            success: false,
            message: "Something went wrong",
            error: error.message
        })
    }
}


export const getUser = async (req, res) => {
    try {

        const {id} = req.params;

        if(!id) {
            throw new Error("ID is required")
        }

        const user = await userModel.findOne({_id: id})
        res.status(200).send({
            success: true,
            message: "Fetching User Succcessfull",
            user,
        })
        
    } catch (error) {
        res.status(400).send({
            success: false,
            message: "Something Went Wrong",
            error: error.message
        })
    }
}


export const searchUser = async (req, res) => {
    try {
  
      const { keyword } = req.params;
      const searchedResults = await userModel.find({
        $or: [
          { name: { $regex: keyword, $options: 'i' } },
          { phone: { $regex: keyword, $options: 'i' } }
        ]
      });
  
      res.status(200).send({
        success: true,
        message: "User Found",
        searchedResults
      })
  
    } catch (error) {
      console.log(error)
      res.status(400).send({
        success: false,
        message: "Error While Searching User",
        error
      })
    }
  }