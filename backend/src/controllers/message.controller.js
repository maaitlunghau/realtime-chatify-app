import cloudinary from "../lib/cloudinary.js";
import Message from "../models/Message.js";
import User from "../models/User.js";

const getAllContacts = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

        return res.status(200).json({
            success: true,
            message: "✅ Gotten all contacts successfully",
            contacts: filteredUsers
        });

    } catch (error) {
        console.error("Error in get all contacts controller:", error);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error",
        });
    }
}

const getChatPartners = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;

        // find all the messages where the logged-in user is either sender or receiver
        const messages = await Message.find({
            $or: [
                { senderId: loggedInUserId },
                { receiverId: loggedInUserId }
            ]
        });

        const chatPartnerIds = [
            ...new Set(
                messages.map((msg) => msg.senderId.toString() === loggedInUserId.toString()
                    ? msg.receiverId.toString()
                    : msg.senderId.toString()
                )
            )
        ];

        const chatPartners = await User.find({ _id: { $in: chatPartnerIds } }).select("-password");

        return res.status(200).json({
            success: true,
            message: "✅ Gotten all chat partners successfully",
            chats: chatPartners
        });

    } catch (error) {
        console.error("Error in get all chat partners controller:", error);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error"
        })
    }
}

const getMessagesByUserId = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const { id: receiverId } = req.params;

        const receiverExists = await User.exists({ _id: receiverId });
        if (!receiverExists) {
            return res.status(404).json({
                success: false,
                message: "Receiver not found"
            });
        }

        const messages = await Message.find({
            $or: [
                { senderId: loggedInUserId, receiverId: receiverId },
                { senderId: receiverId, receiverId: loggedInUserId },
            ]
        }).sort({ createdAt: 1 });

        return res.status(200).json({
            success: true,
            message: `✅ Gotten all messages successfully`,
            messages
        });

    } catch (error) {
        console.error("Error in get messages controller:", error);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
}

const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        if (!text && !image) {
            return res.status(400).json({
                success: false,
                message: "Context message is required."
            });
        }

        const senderId = req.user._id;
        const { id: receiverId } = req.params;

        const receiverExists = await User.exists({ _id: receiverId });
        if (!receiverExists) {
            return res.status(404).json({
                success: false,
                message: "Receiver not found"
            });
        }
        if (senderId.equals(receiverId)) {
            return res.status(400).json({
                success: false,
                message: "Cannot send message to yourself."
            });
        }

        let imageUrl;
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId: senderId,
            receiverId: receiverId,
            text,
            image: imageUrl
        });

        await newMessage.save();

        // todos: send message in real-time if user is online - socket.io

        return res.status(201).json({
            success: true,
            message: `✅ Sent a new message successfully`,
            data: newMessage
        });

    } catch (error) {
        console.error("Error in send message controller:", error);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error"
        })
    }
}

export {
    getAllContacts,
    getChatPartners,
    getMessagesByUserId,
    sendMessage
}