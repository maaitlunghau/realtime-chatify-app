import { Outlet } from "react-router";

function ChatLayout() {
    return (
        <div className="min-h-screen w-full flex">
            <Outlet />
        </div>
    );
}

export default ChatLayout;
