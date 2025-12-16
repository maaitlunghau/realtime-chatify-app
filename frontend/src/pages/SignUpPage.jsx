import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Link } from "react-router";

import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import {
    MessageCircleIcon,
    LockIcon,
    MailIcon,
    UserIcon,
    LoaderIcon,
    EyeIcon,
    EyeOff,
} from "lucide-react";

function SignUpPage() {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
    });

    const { signup, isSigningUp } = useAuthStore();
    const [isShowPassword, setIsShowPassword] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        signup(formData);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    return (
        <div className="w-full flex items-center justify-center px-4 bg-slate-900">
            <div className="relative w-full max-w-5xl">
                <BorderAnimatedContainer>
                    <div className="w-full flex flex-col md:flex-row max-h-[600px]">
                        {/* <div className="w-full flex flex-col md:flex-row max-h-[480px] xl:max-h-[520px]"> */}
                        {/* LEFT - FORM */}
                        <div className="md:w-1/2 p-12 flex items-center justify-center md:border-r border-slate-600/30">
                            <div className="w-full max-w-md">
                                {/* HEADING */}
                                <div className="text-center pt-6 xl:p-0 mb-3 xl:mb-6">
                                    <MessageCircleIcon className="w-10 h-10 mx-auto text-slate-400 mb-4" />
                                    <h2 className="text-lg font-bold text-slate-200 mb-1">
                                        Create Account
                                    </h2>
                                    <p className="text-slate-400 text-sm">
                                        Sign up for a new account
                                    </p>
                                </div>

                                {/* FORM */}
                                <form
                                    onSubmit={handleSubmit}
                                    className="space-y-4 pb-6 xl:p-0"
                                >
                                    {/* FULL NAME */}
                                    <div>
                                        <label className="auth-input-label">
                                            Full Name
                                        </label>
                                        <div className="relative">
                                            <UserIcon className="auth-input-icon" />
                                            <input
                                                name="fullName"
                                                type="text"
                                                value={formData.fullName}
                                                onChange={handleInputChange}
                                                className="input"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                    </div>

                                    {/* EMAIL */}
                                    <div>
                                        <label className="auth-input-label">
                                            Email
                                        </label>
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

                                    {/* PASSWORD */}
                                    <div>
                                        <label className="auth-input-label">
                                            Password
                                        </label>
                                        <div className="relative">
                                            <LockIcon className="auth-input-icon" />
                                            <input
                                                name="password"
                                                type={
                                                    isShowPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                className="input"
                                                placeholder="Enter your password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setIsShowPassword(
                                                        !isShowPassword
                                                    )
                                                }
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
                                        <span className="mx-3 text-xs text-slate-400">
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
                                            <img
                                                src="./icons/google.svg"
                                                alt="Google"
                                                className="w-5 h-5"
                                            />
                                            Continue with Google
                                        </button>

                                        <button
                                            type="button"
                                            className="social-btn"
                                        >
                                            <img
                                                src="./icons/github.svg"
                                                alt="GitHub"
                                                className="w-5 h-5"
                                            />
                                            Continue with GitHub
                                        </button>
                                    </div>

                                    {/* SUBMIT */}
                                    <button
                                        type="submit"
                                        className="auth-btn"
                                        disabled={isSigningUp}
                                    >
                                        {isSigningUp ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <LoaderIcon className="h-5 animate-spin" />
                                                <span>Create Account</span>
                                            </div>
                                        ) : (
                                            "Create Account"
                                        )}
                                    </button>

                                    {/* FOOTER */}
                                    <div className="text-center">
                                        <Link
                                            to="/login"
                                            className="auth-link"
                                        >
                                            Already have an account? Login
                                        </Link>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* RIGHT - ILLUSTRATION */}
                        <div className="hidden md:w-1/2 md:flex items-center justify-center bg-gradient-to-bl from-slate-800/20 to-transparent">
                            <div>
                                <img
                                    src="./signup.png"
                                    alt="Signup illustration"
                                    className="max-w-96 h-auto object-contain"
                                />

                                <div className="text-center pb-10">
                                    <h3 className="text-xl font-medium text-cyan-400">
                                        Start Your Journey Today
                                    </h3>

                                    <div className="mt-4 flex justify-center gap-4">
                                        <span className="auth-badge">
                                            Free
                                        </span>
                                        <span className="auth-badge">
                                            Easy
                                        </span>
                                        <span className="auth-badge">
                                            Private
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </BorderAnimatedContainer>
            </div>
        </div>
    );
}

export default SignUpPage;
