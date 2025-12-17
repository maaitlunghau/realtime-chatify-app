import { useChatStore } from "../store/useChatStore";

import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import ProfileHeader from "../components/ProfileHeader";
import ActiveTabSwitch from "../components/ActiveTabSwitch";
import ChatsList from "../components/ChatsList";
import ContactsList from "../components/ContactsList";
import ChatContainer from "../components/ChatContainer";
import NoConversationPlaceholder from "../components/NoConversationPlaceholder";

function ChatPage() {
    const { activeTab, selectedUser } = useChatStore();

    return (
        <div className="relative w-full min-h-screen">
            <div className="w-full h-full flex overflow-hidden bg-slate-900">
                {/* LEFT SIDE */}
                <div className="w-[350px] bg-slate-800/50 backdrop-blur-sm flex flex-col">
                    <ProfileHeader />
                    <ActiveTabSwitch />

                    <div className="flex-1 overflow-y-auto p-4 space-y-2 border-r border-slate-600/50 w-full">
                        {activeTab === "chats" ? <ChatsList /> : <ContactsList />}
                    </div>
                </div>

                {/* RIGHT SIDE */}
                <div className="flex-1 flex flex-col bg-slate-900/50 backdrop-blur-sm">
                    {selectedUser ? <ChatContainer /> : <NoConversationPlaceholder />}
                </div>
            </div>
        </div>
    )
}

export default ChatPage