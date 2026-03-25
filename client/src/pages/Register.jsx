import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password.length < 6) {
            toast.error('Password must be at least 6 characters!');
            return;
        }
        setLoading(true);
        try {
            const res = await axios.post('/auth/register', { name, email, password });
            login(res.data.token, res.data.user);
            toast.success('Account created! Welcome 🎉');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed!');
        } finally {
            setLoading(false);
        }
    };

    const passwordStrength = () => {
        if (password.length === 0) return null;
        if (password.length < 6) return { label: 'Too short', color: 'bg-red-400', width: 'w-1/4' };
        if (password.length < 8) return { label: 'Weak', color: 'bg-orange-400', width: 'w-2/4' };
        if (password.length < 12) return { label: 'Good', color: 'bg-yellow-400', width: 'w-3/4' };
        return { label: 'Strong', color: 'bg-green-500', width: 'w-full' };
    };

    const strength = passwordStrength();

    return (
        <div className="flex min-h-screen bg-gray-50">

            {/* Left Panel */}
            <div className="flex-col justify-between hidden p-12 bg-blue-600 lg:flex lg:w-1/2">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 text-xl font-black text-blue-600 bg-white rounded-xl">F</div>
                    <span className="text-xl font-bold text-white">Freelancer Platform</span>
                </div>

                <div>
                    <h2 className="mb-4 text-4xl font-black leading-tight text-white">
                        Start managing your freelance work today
                    </h2>
                    <p className="mb-10 text-lg text-blue-200">
                        Join thousands of freelancers who trust our platform to run their business.
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { value: '100%', label: 'Free Forever' },
                            { value: '4-in-1', label: 'All tools included' },
                            { value: 'PDF', label: 'Invoice export' },
                            { value: '🔐', label: 'Secure & private' },
                        ].map((stat) => (
                            <div key={stat.label} className="p-4 bg-blue-500 bg-opacity-40 rounded-2xl">
                                <p className="text-2xl font-black text-white">{stat.value}</p>
                                <p className="mt-1 text-sm text-blue-200">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-5 bg-blue-500 bg-opacity-40 rounded-2xl">
                    <p className="text-sm italic text-white">
                        "Finally a tool that understands what freelancers actually need!"
                    </p>
                    <p className="mt-2 text-xs text-blue-200">— Independent developer</p>
                </div>
            </div>

            {/* Right Panel */}
            <div className="flex items-center justify-center flex-1 p-8">
                <div className="w-full max-w-md">

                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-6 lg:hidden">
                            <div className="flex items-center justify-center w-8 h-8 font-black text-white bg-blue-600 rounded-lg">F</div>
                            <span className="font-bold text-gray-900">Freelancer Platform</span>
                        </div>
                        <h1 className="mb-2 text-3xl font-black text-gray-900">
                            Create your account
                        </h1>
                        <p className="text-gray-400">
                            Free forever. No credit card required.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Name */}
                        <div>
                            <label className="block mb-2 text-sm font-semibold text-gray-700">
                                Full Name
                            </label>
                            <div className="relative">
                                <div className="absolute text-gray-400 -translate-y-1/2 left-4 top-1/2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    placeholder="Your full name"
                                    className="w-full py-3 pl-12 pr-4 text-gray-900 placeholder-gray-400 transition border border-gray-200 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

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
                            <label className="block mb-2 text-sm font-semibold text-gray-700">
                                Password
                            </label>
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
                                    placeholder="Min. 6 characters"
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

                            {/* Password Strength Indicator */}
                            {strength && (
                                <div className="mt-2">
                                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`} />
                                    </div>
                                    <p className={`text-xs mt-1 font-medium ${
                                        strength.label === 'Strong' ? 'text-green-500' :
                                        strength.label === 'Good' ? 'text-yellow-500' :
                                        strength.label === 'Weak' ? 'text-orange-500' :
                                        'text-red-500'
                                    }`}>
                                        {strength.label} password
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Submit */}
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
                                    Creating account...
                                </>
                            ) : (
                                'Create free account'
                            )}
                        </button>

                    </form>

                    <div className="flex items-center gap-4 my-6">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-sm text-gray-400">or</span>
                        <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    <p className="text-sm text-center text-gray-500">
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold text-blue-600 hover:underline">
                            Sign in
                        </Link>
                    </p>

                </div>
            </div>
        </div>
    );
}

export default Register;
