import mongoose from "mongoose";
import { ENV } from "../lib/env.js";

export const connectDB = async () => {
    try {
        if (!ENV.MONGO_URL) {
            throw new Error("MONGO_URL environment variable is not defined");
        }

        const conn = await mongoose.connect(ENV.MONGO_URL);
        console.log("✅ MongoDB Atlas connected: ", conn.connection.host);

    } catch (err) {
        console.error("Error connection to MongoDB Atlas: ", err);
        process.exit(1); // 1: status code means fail, 0 means success
    }
};