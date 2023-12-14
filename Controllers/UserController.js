import { comparePassword, hashPassword } from "../Helpers/authHelper.js";
import userModel from "../Models/userModel.js";
import JWT from 'jsonwebtoken';
import fs from 'fs'

export const newUser = async (req, res) => {
    const {name, phone, email, password, answer} = req.fields;
    const {profilePhoto} = req.files;

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
        if(!profilePhoto) {
            return res.send({message: 'Photo Is Required'});
        }

        const existingUser = await userModel.findOne({phone});

        if(existingUser) {
            return res.status(200).send({
                error: 'The Provided Phone No. Is Already Registered'
            })
        } else {

            const hanshedPassword = await hashPassword(password);
            
            const user =  new userModel({...req.fields, password: hanshedPassword});

            if(profilePhoto) {
                user.profilePhoto.data = fs.readFileSync(profilePhoto.path);
                user.profilePhoto.contentType = profilePhoto.type;
            }
            
            await user.save();
            
            res.status(200).send({
                success: true,
                message: 'Registration Successfull',
                user 
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
        const {phone, password} = req.fields;

        if(!phone) {
            res.send({error: 'Phone is Required'})
        }
        if(!password) {
            res.send({error: 'Password is Required'})
        }

        const user = await userModel.findOne({phone: phone});

        if(!user) {
            res.status(400).send({
                success: false,
                message: 'Phone No. Is Not Registered, SignUp to Get Started'
            })
        } else {
            const match = await comparePassword(password, user.password);

            if(!match) {
                res.status(400).send({
                    success: false,
                    message: 'Invalid Password'
                })
            } else {
                const token = JWT.sign({_id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});
                res.status(200).send({
                    success: true,
                    message: 'Logged In Successfully',
                    user:  {
                        _id: user._id,
                        name: user.name,
                        phone: user.phone,
                        email: user.email,
                        
                    },
                    token
                })
            }
        }

    } catch (error) {
        res.status(400).send({
            success: false,
            message: 'Something Went wrong',
            error
        })
    }
}