import express from "express";


const messageRouter = express.Router();

messageRouter.get("/send", (req, res) => {
    res.send("Send message endpoint");
});


export default messageRouter;