import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URL);
        console.log("✅ MongoDB Atlas connected: ", conn.connection.host);

    } catch (err) {
        console.error("Error connection to MongoDB Atlas: ", error);
        process.exit(1); // 1: status code means fail, 0 means success
    }
};