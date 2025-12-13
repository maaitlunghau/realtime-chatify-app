import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ENV } from "../lib/env.js";

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized - No token provided"
            });
        }

        const decoded = jwt.verify(token, ENV.JWT_SECRET);
        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized - Invalid token"
            });
        }

        const user = await User.findById(decoded.userId).select("-password");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found!"
            });
        }

        req.user = user;
        next();

    } catch (err) {
        console.error("Error in protect route middleware:", err);
        return res.status(500).json({
            success: false,
            message: "Interval server error"
        });
    }
}