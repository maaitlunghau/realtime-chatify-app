import { Navigate, Route, Routes } from "react-router";
import { useAuthStore } from "./store/useAuthStore";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";

import ChatPage from "./pages/ChatPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import PageLoader from "./components/PageLoader";
import SignUpPage2 from "./pages/SignUpPage2";
import AuthLayout from "./layout/AuthLayout";
import ChatLayout from "./layout/ChatLayout";

export default function App() {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  console.log({ authUser });

  if (isCheckingAuth) return <PageLoader />;

  return (
    <div>
      <>
        <Routes>
          {/* Auth Pages */}
          <Route element={<AuthLayout />}>
            <Route
              path="/login"
              element={!authUser ? < LoginPage /> : <Navigate to={"/"} />}
            />
            <Route
              path="/signup"
              element={!authUser ? < SignUpPage /> : <Navigate to={"/"} />}
            />
            <Route
              path="/signup-2"
              element={!authUser ? < SignUpPage2 /> : <Navigate to={"/"} />}
            />
          </Route>

          {/* Chat Page */}
          <Route element={<ChatLayout />}>
            <Route
              path="/"
              element={authUser ? <ChatPage /> : <Navigate to={"/login"}
              />} />
          </Route>
        </Routes>

        <Toaster />
      </>
    </div >
  )
}
