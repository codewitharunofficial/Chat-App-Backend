import mongoose from "mongoose";

const connectToDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_DB_URL);
        console.log(`Connected To MongoDB ${conn.connection.host}` );
    } catch (error) {
        console.log(`Error While Connecting To DB ${error}`);
    }
}

export default connectToDB