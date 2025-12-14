import { useState } from "react"
import { useAuthStore } from "../store/useAuthStore";
import { Link } from "react-router";

import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import {
    MessageCircleIcon,
    LockIcon,
    MailIcon,
    LoaderIcon,
    EyeIcon,
    EyeOff,
} from "lucide-react";

function LoginPage() {
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const { login, isLoggingIn } = useAuthStore();
    const [isShowPassword, setIsShowPassword] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();

        login(formData);
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value
        });
    }

    return (
        <div className="w-full flex items-center justify-center p-4 bg-slate-900 min-h-screen">
            <div className="relative w-full max-w-6xl">
                <BorderAnimatedContainer>
                    <div className="w-full flex flex-col md:flex-row">
                        {/* FORM LEFT - LEFT SIDE */}
                        <div className="md:w-1/2 p-8 flex items-center justify-center md:border-r border-slate-600/30">
                            <div className="w-full max-w-md">
                                {/* HEADING TEXT */}
                                <div className="text-center mb-6">
                                    <MessageCircleIcon className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                                    <h2 className="text-xl font-bold text-slate-200 mb-2">
                                        Welcome Back
                                    </h2>
                                    <p className="text-slate-400">
                                        Login to access your account
                                    </p>
                                </div>

                                {/* FORM */}
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* EMAIL INPUT */}
                                    <div>
                                        <label className="auth-input-label">Email</label>
                                        <div className="relative">
                                            <MailIcon className="auth-input-icon" />
                                            <input
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className="input"
                                                placeholder="johndoe@gmail.com"
                                            />
                                        </div>
                                    </div>

                                    {/* PASSWORD INPUT */}
                                    <div>
                                        <label className="auth-input-label">Password</label>
                                        <div className="relative">
                                            <LockIcon className="auth-input-icon" />
                                            <input
                                                name="password"
                                                type={isShowPassword ? "text" : "password"}
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                className="input"
                                                placeholder="Enter your password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setIsShowPassword(!isShowPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                                            >
                                                {isShowPassword ? (
                                                    <EyeIcon className="size-5" />
                                                ) : (
                                                    <EyeOff className="size-5" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* DIVIDER */}
                                    <div className="relative my-6 flex items-center">
                                        <div className="flex-grow border-t border-slate-700" />
                                        <span className="mx-3 text-sm text-slate-400">
                                            OR
                                        </span>
                                        <div className="flex-grow border-t border-slate-700" />
                                    </div>

                                    {/* SOCIAL LOGIN */}
                                    <div className="flex gap-4">
                                        <button
                                            type="button"
                                            className="social-btn"
                                        >
                                            <img src="./icons/google.svg" alt="Google" className="w-5 h-5" />
                                            Continue with Google
                                        </button>

                                        <button
                                            type="button"
                                            className="social-btn"
                                        >
                                            <img src="./icons/github.svg" alt="GitHub" className="w-5 h-5" />
                                            Continue with GitHub
                                        </button>

                                    </div>

                                    {/* SUBMIT BUTTON */}
                                    <button
                                        className="auth-btn"
                                        type="submit"
                                        disabled={isLoggingIn}
                                    >
                                        {isLoggingIn ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <LoaderIcon className="h-5 animate-spin text-center" />
                                                <span>Sign In</span>
                                            </div>
                                        ) : (
                                            "Sign In"
                                        )}
                                    </button>

                                    {/* FOOTERING */}
                                    <div className="mt-6 text-center">
                                        <Link to={"/signup"} className="auth-link">
                                            Don't have an account? Sign Up
                                        </Link>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* FORM ILLUSTRATION - RIGHT SIDE */}
                        <div className="hidden md:w-1/2 md:flex items-center justify-center p-12 bg-gradient-to-bl from-slate-800/20 to-transparent">
                            <div>
                                <img
                                    src="./login.png"
                                    alt="People using mobile object-contain"
                                    className="w-100 h-auto object-contain"
                                />
                                <div className="mt-6 text-center">
                                    <h3 className="text-xl font-medium text-cyan-400">
                                        Connect Anytime, Anywhere
                                    </h3>

                                    <div className="mt-4 flex justify-center gap-4">
                                        <span className="auth-badge">Secure</span>
                                        <span className="auth-badge">Fast</span>
                                        <span className="auth-badge">Reliable</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </BorderAnimatedContainer>
            </div>
        </div>
    )
}

export default LoginPage