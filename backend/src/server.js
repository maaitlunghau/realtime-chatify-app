/**
 * -------------------------------------
 *        Server - Realtime App
 * -------------------------------------
 */
import express from "express";
import dotenv from "dotenv";
import path from "path";

import authRouter from "./routes/auth.routes.js";
import messageRoutes from "./routes/message.routes.js";


dotenv.config();
const __dirname = path.resolve();

const app = express();

app.use("/api/auth", authRouter);
app.use("/api/messages", messageRoutes);

// make ready for deployment (render)
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")));

    app.get("*", (_, res) => {
        res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
    });
}


const PORT = process.env.PORT || 3000;
app.listen(3000, () => console.log(`✅ Server is running now on port ${PORT}`));