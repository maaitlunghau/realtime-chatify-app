import { sendWelcomeEmail } from "../emails/emailHandlers.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { ENV } from "../lib/env.js";
import cloudinary from "../lib/cloudinary.js";

const signup = async (req, res) => {
    const { fullName, email, password } = req.body;

    try {
        if (!fullName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters"
            });
        }

        // check if email valid: regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format"
            });
        }

        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                success: false,
                message: "Email already exists"
            });
        }

        // hashing password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword
        });

        if (newUser) {
            const savedUser = await newUser.save();
            generateToken(savedUser._id, res);

            res.status(201).json({
                success: true,
                message: "✅ Signed up user successfully",
                user: {
                    _id: newUser._id,
                    fullName: newUser.fullName,
                    email: newUser.email,
                    profilePic: newUser.profilePic
                }
            });

            try {
                await sendWelcomeEmail(savedUser.email, savedUser.fullName, ENV.CLIENT_URL);

            } catch (err) {
                console.error("Failed to send welcome email:", err);
            }

        } else {
            res.status(400).json({
                success: false,
                message: "Invalid user data"
            });
        }

    } catch (err) {
        console.log("Error in signup controller:", err)
        return res.status(500).json({
            success: false,
            message: "Interval server error"
        });
    }
}

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required"
        });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials!"
            });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials!"
            });
        }

        generateToken(user._id, res);

        return res.status(200).json({
            success: true,
            message: "✅ Logged in user successfully",
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                profilePic: user.profilePic
            }
        })

    } catch (err) {
        console.error("Error in login controller:", err);
        return res.status(500).json({
            success: false,
            message: "Interval server error"
        })
    }
}

const logout = (_, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 });

        return res.status(200).json({
            success: true,
            message: "✅ Logged out successfully"
        })

    } catch (err) {
        console.error("Error in logout controller:", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

const updateProfile = async (req, res) => {
    try {
        const { profilePic } = req.body;
        if (!profilePic) {
            return res.status(400).json({
                success: false,
                message: "Profile pic is required"
            });
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic, {
            folder: "profile_pics",
            allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"]
        });

        const userId = req.user._id;
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profilePic: uploadResponse.secure_url },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "✅ Update profile user successfully",
            updated_user: updatedUser
        });

    } catch (err) {
        console.error("Error in update profile controller:", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

export {
    signup,
    login,
    logout,
    updateProfile
}