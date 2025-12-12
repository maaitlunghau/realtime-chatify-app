import express from "express";


const authRouter = express.Router();

authRouter.get("/signup", (req, res) => {
    res.send("Signup endpoint");
});

authRouter.get("/login", (req, res) => {
    res.send("Login endpoint");
});

authRouter.get("/logout", (req, res) => {
    res.send("Logout endpoint");
});


export default authRouter;