import { useState } from "react"
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

function SignUpPage2() {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: ""
    });
    const { signup, isSigningUp } = useAuthStore();
    const [isShowPassword, setIsShowPassword] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();

        signup(formData);
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value
        });
    }

    return (
        <div className="flex items-center justify-center p-4 bg-slate-900 min-h-screen">
            <div className="relative w-full max-w-6xl">
                <BorderAnimatedContainer>
                    <div className="w-full flex flex-col md:flex-row">
                        {/* FORM LEFT - LEFT SIDE */}
                        <div className="w-full py-8 px-12 flex items-center justify-center md:border-r border-slate-600/30">
                            <div className="w-full max-w-md">
                                {/* HEADING TEXT */}
                                <div className="text-center mb-6">
                                    <MessageCircleIcon className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                                    <h2 className="text-xl font-bold text-slate-200 mb-2">
                                        Create Account
                                    </h2>
                                    <p className="text-slate-400">
                                        Sign up for a new account
                                    </p>
                                </div>

                                {/* FORM */}
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* FULL NAME INPUT */}
                                    <div>
                                        <label className="auth-input-label">Full Name</label>
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

                                    {/* EMAIL INPUT */}
                                    <div>
                                        <label className="auth-input-label">Email</label>
                                        <div className="relative">
                                            <MailIcon className="auth-input-icon" />
                                            <input
                                                name="email"
                                                type="text"
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
                                        disabled={isSigningUp}
                                    >
                                        {isSigningUp ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <LoaderIcon className="h-5 animate-spin text-center" />
                                                <span>Create Account</span>
                                            </div>
                                        ) : (
                                            "Create Account"
                                        )}
                                    </button>

                                    {/* FOOTERING */}
                                    <div className="mt-6 text-center">
                                        <Link to={"/login"} className="auth-link">
                                            Already have an account? Login
                                        </Link>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </BorderAnimatedContainer>
            </div>
        </div>
    )
}

export default SignUpPage2