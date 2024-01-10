import bcrypt from "bcryptjs";
// import userModel from '../Modals/userModel';

export const hashPassword = async (password) => {
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    console.log(error);
  }
};

export const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

export const hashOTP = async (OTP) => {
  try {
    const saltRounds = 10;
    const hashedOTP = await bcrypt.hash(OTP, saltRounds);
    return hashedOTP;
  } catch (error) {
    console.log(error);
  }
};

export const compareOTP = async (OTP, hashedOTP) => {
  return bcrypt.compare(OTP, hashedOTP);
};
