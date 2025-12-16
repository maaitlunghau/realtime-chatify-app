import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

export const useChatStore = create((set, get) => ({
    allContacts: [],
    chats: [],
    messages: [],
    activeTab: "chats",
    selectedUser: null,
    isUserLoading: false,
    isMessagesLoading: false,
    isSoundEnabled: localStorage.getItem("isSoundEnabled") === true,

    toggleSound: () => {
        localStorage.setItem("isSoundEnabled", !get().isSoundEnabled);
        set({ isSoundEnabled: !get().isSoundEnabled })
    },

    setActiveTab: (tab) => set({ activeTab: tab }),
    setSelectedUser: (selectedUser) => set({ selectedUser: selectedUser }),

    getAllContacts: async () => {
        set({ isUserLoading: true });

        try {
            const res = axiosInstance.get("/messages/contacts");
            set({ allContacts: res.data.contacts });

        } catch (error) {
            toast.error(error.response?.data?.message);
        } finally {
            set({ isUserLoading: false });
        }
    },

    getMyChatPartners: async () => {
        set({ isUserLoading: true });

        try {
            const res = axiosInstance.get("/messages/chats");
            set({ chats: res.data.chats });

        } catch (error) {
            toast.error(error.response?.data?.message);
        } finally {
            set({ isUserLoading: false });
        }
    },
}))