import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { arcjetProtection } from "../middlewares/arcjet.middleware.js";
import {
    getAllContacts,
    getChatPartners,
    getMessagesByUserId,
    sendMessage
} from "../controllers/message.controller.js";

const messageRouter = express.Router();

messageRouter.use(arcjetProtection, protectRoute);

messageRouter.get("/contacts", getAllContacts);
messageRouter.get("/chats", getChatPartners);
messageRouter.get("/:id", getMessagesByUserId);
messageRouter.post("/send/:id", sendMessage);

export default messageRouter;