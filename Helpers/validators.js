import { body } from "express-validator";


export const signUpValidator = [
    body('email', "Invalid Email").isEmail(),
    body('password', "Password Should be of atleast 6 characters & a combination of upper, lowercase numbers & symbols").isLength({min: 6}).isStrongPassword({minLowercase: 1, minSymbols: 1, minUppercase: 1, minNumbers: 1}),
    body('phone', "Invalid Phone No.").isMobilePhone('en-IN')
]

export const ForgotPasswordValidator = [
    body('password', "Password Should be of atleast 6 characters & a combination of upper, lowercase numbers & symbols").isLength({min: 6}).isStrongPassword({minLowercase: 1, minSymbols: 1, minUppercase: 1, minNumbers: 1}),
]