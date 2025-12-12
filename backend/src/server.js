/**
 * -------------------------------------
 *        Server - Realtime App
 * -------------------------------------
 */
import express from "express";
import dotenv from "dotenv";

import authRouter from "./routes/auth.routes.js";
import messageRoutes from "./routes/message.routes.js";


dotenv.config();
const app = express();

app.use("/api/auth", authRouter);
app.use("/api/messages", messageRoutes);


const PORT = process.env.PORT || 3000;
app.listen(3000, () => console.log(`✅ Server is running now on port ${PORT}`));