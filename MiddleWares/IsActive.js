import userModel from "../Models/userModel.js";
import JWT from 'jsonwebtoken'

//Is active

export const requireSignIn = async (req, res, next) => {
    try {
        const decode = JWT.verify(req.headers.authorization, process.env.JWR_SECRET);
        req.user = decode;
        next();
    } catch (error) {
        res.status(401).send({
            success: false,
            message: "Error In Validation",
            error: error.message
        })
    }
} 