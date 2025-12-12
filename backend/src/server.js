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
import { connectDB } from "./lib/db.js";
import { jsonParser, urlencodedParser } from "./middlewares/parser.middleware.js";


dotenv.config();
const __dirname = path.resolve();

const app = express();
app.use(jsonParser);
app.use(urlencodedParser);

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
connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`✅ Server is running now on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Failed to connect to database:", error);
        process.exit(1);
    });