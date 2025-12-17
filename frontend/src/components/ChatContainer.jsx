
import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

import ChatHeader from "./ChatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import MessageInput from "./MessageInput";
import MessageLoadingSkeleton from "./MessageLoadingSkeleton";

function ChatContainer() {
    const { messages, selectedUser, getMessagesByUserId, isMessagesLoading } = useChatStore();
    const { authUser } = useAuthStore();

    useEffect(() => {
        if (selectedUser?._id) getMessagesByUserId(selectedUser._id);
    }, [getMessagesByUserId, selectedUser]);

    if (!authUser) return null;

    return (
        <>
            {/* Chat Header */}
            <ChatHeader />

            {/* Chat Content */}
            <div className="flex-1 px-6 overflow-y-auto py-8">
                {isMessagesLoading ? (
                    <MessageLoadingSkeleton />
                ) : messages.length > 0 ? (
                    <div className="max-w-3xl mx-auto space-y-6">
                        {messages.map(msg => (
                            <div
                                key={msg._id}
                                className={`chat ${msg.senderId === authUser._id ? "chat-end" : "chat-start"
                                    }`}
                            >
                                <div
                                    className={`chat-bubble ${msg.senderId === authUser._id
                                        ? "bg-cyan-600 text-white"
                                        : "bg-slate-700 text-slate-200"
                                        }`}
                                >
                                    {msg.image && (
                                        <img
                                            src={msg.image}
                                            alt="shared"
                                            className="rounded-lg h-48 object-cover"
                                        />
                                    )}

                                    {msg.text && <p className="mt-1">{msg.text}</p>}

                                    <p className="text-xs mt-1 opacity-75">
                                        {new Date(msg.createdAt).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <NoChatHistoryPlaceholder />
                )}
            </div>

            {/* Message Input */}
            <MessageInput />
        </>
    )
}

export default ChatContainer