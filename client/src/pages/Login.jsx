import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post('/auth/login', { email, password });
            login(res.data.token, res.data.user);
            toast.success('Welcome back! 👋');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">

            {/* Left Panel — Branding */}
            <div className="flex-col justify-between hidden p-12 bg-blue-600 lg:flex lg:w-1/2">

                {/* Logo */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 text-xl font-black text-blue-600 bg-white rounded-xl">
                        F
                    </div>
                    <span className="text-xl font-bold text-white">Freelancer Platform</span>
                </div>

                {/* Center Content */}
                <div>
                    <h2 className="mb-4 text-4xl font-black leading-tight text-white">
                        Manage your freelance<br />work effortlessly
                    </h2>
                    <p className="mb-10 text-lg text-blue-200">
                        Track clients, tasks, payments and generate invoices — all in one place.
                    </p>

                    {/* Feature Pills */}
                    <div className="flex flex-col gap-3">
                        {[
                            { icon: '👥', text: 'Client Management' },
                            { icon: '✅', text: 'Task Tracking' },
                            { icon: '💰', text: 'Payment Tracking' },
                            { icon: '🧾', text: 'Invoice Generation' },
                        ].map((f) => (
                            <div key={f.text} className="flex items-center gap-3 px-4 py-3 bg-blue-500 bg-opacity-40 rounded-xl">
                                <span className="text-xl">{f.icon}</span>
                                <span className="font-medium text-white">{f.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Quote */}
                <div className="p-5 bg-blue-500 bg-opacity-40 rounded-2xl">
                    <p className="text-sm italic text-white">
                        "The platform every freelancer needs — from day one to scaling up."
                    </p>
                    <p className="mt-2 text-xs text-blue-200">— Built for independent professionals</p>
                </div>
            </div>

            {/* Right Panel — Login Form */}
            <div className="flex items-center justify-center flex-1 p-8">
                <div className="w-full max-w-md">

                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-6 lg:hidden">
                            <div className="flex items-center justify-center w-8 h-8 font-black text-white bg-blue-600 rounded-lg">F</div>
                            <span className="font-bold text-gray-900">Freelancer Platform</span>
                        </div>
                        <h1 className="mb-2 text-3xl font-black text-gray-900">
                            Welcome back
                        </h1>
                        <p className="text-gray-400">
                            Sign in to your account to continue
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Email */}
                        <div>
                            <label className="block mb-2 text-sm font-semibold text-gray-700">
                                Email address
                            </label>
                            <div className="relative">
                                <div className="absolute text-gray-400 -translate-y-1/2 left-4 top-1/2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                    </svg>
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="you@example.com"
                                    className="w-full py-3 pl-12 pr-4 text-gray-900 placeholder-gray-400 transition border border-gray-200 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Password
                                </label>
                            </div>
                            <div className="relative">
                                <div className="absolute text-gray-400 -translate-y-1/2 left-4 top-1/2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="Enter your password"
                                    className="w-full py-3 pl-12 pr-12 text-gray-900 placeholder-gray-400 transition border border-gray-200 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute text-gray-400 -translate-y-1/2 right-4 top-1/2 hover:text-gray-600"
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center justify-center w-full gap-2 py-3 font-semibold text-white transition bg-blue-600 shadow-sm rounded-xl hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Signing in...
                                </>
                            ) : (
                                'Sign in'
                            )}
                        </button>

                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-6">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-sm text-gray-400">or</span>
                        <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    {/* Register Link */}
                    <p className="text-sm text-center text-gray-500">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-semibold text-blue-600 hover:underline">
                            Create one free
                        </Link>
                    </p>

                </div>
            </div>
        </div>
    );
}

export default Login;