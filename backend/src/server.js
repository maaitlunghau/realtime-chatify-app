/**
 * -------------------------------------
 *        Server - Realtime App
 * -------------------------------------
 */
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRouter from "./routes/auth.routes.js";
import messageRoutes from "./routes/message.routes.js";
import { connectDB } from "./lib/db.js";
import { jsonParser, urlencodedParser } from "./middlewares/parser.middleware.js";
import { ENV } from "./lib/env.js";


const __dirname = path.resolve();
const app = express();

app.use(jsonParser);
app.use(urlencodedParser);
app.use(cookieParser());
app.use(cors({
    origin: ENV.CLIENT_URL,
    credentials: true
}));

app.use("/api/auth", authRouter);
app.use("/api/messages", messageRoutes);

// make ready for deployment (render)
if (ENV.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")));

    app.get("*", (_, res) => {
        res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
    });
}


const PORT = ENV.PORT || 3000;
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