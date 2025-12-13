import express from "express";
import {
    login,
    logout,
    signup,
    updateProfile
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const authRouter = express.Router();

authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.post("/logout", logout);

authRouter.put("/update-profile", protectRoute, updateProfile);

authRouter.get("/check", protectRoute, (req, res) => {
    res.status(200).json(req.user);
})

export default authRouter;