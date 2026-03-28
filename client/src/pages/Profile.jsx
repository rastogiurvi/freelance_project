import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';
import toast from 'react-hot-toast';

function Profile() {
    const { user, login } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({
        totalClients: 0, totalTasks: 0,
        totalEarned: 0, totalPending: 0
    });
    const [form, setForm] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: '',
        address: '',
        bio: '',
        skills: '',
    });
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [clientsRes, tasksRes, summaryRes] = await Promise.all([
                    axios.get('/clients'),
                    axios.get('/tasks'),
                    axios.get('/payments/summary'),
                ]);
                setStats({
                    totalClients: clientsRes.data.length,
                    totalTasks: tasksRes.data.length,
                    totalEarned: summaryRes.data.totalEarned,
                    totalPending: summaryRes.data.totalPending,
                });
            } catch (error) {
                console.error(error);
            }
        };
        fetchStats();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            login(token, { ...user, name: form.name, email: form.email });
            toast.success('Profile saved! ✅');
        } catch (error) {
            toast.error('Failed to save profile!');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = (e) => {
        setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
    };

    const handleSavePassword = (e) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error('Passwords do not match!');
            return;
        }
        if (passwordForm.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters!');
            return;
        }
        toast.success('Password updated! 🔐');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    };

    const tabs = [
        { id: 'profile', label: 'Profile Info' },
        { id: 'security', label: 'Security' },
        { id: 'stats', label: 'My Stats' },
    ];

    const inputClass = "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm";

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 p-8 ml-64">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="mb-1 text-3xl font-bold text-gray-900">Profile</h1>
                    <p className="text-sm text-gray-400">Manage your personal information and settings</p>
                </div>

                {/* Profile Card */}
                <div className="mb-6 overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl">

                    {/* Cover Banner */}
                    <div className="h-24 bg-gradient-to-r from-blue-500 to-blue-600" />

                    {/* Avatar + Info */}
                    <div className="flex items-end gap-4 px-6 pb-6 -mt-8">
                        <div className="flex items-center justify-center flex-shrink-0 w-16 h-16 bg-white border-4 border-white shadow-md rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600">
                            <span className="text-2xl font-black text-white">
                                {user?.name?.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div className="flex-1 mb-1">
                            <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
                            <p className="text-sm text-gray-400">{user?.email}</p>
                        </div>
                        <div className="mb-1">
                            <span className="bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1.5 rounded-full">
                                Freelancer
                            </span>
                        </div>
                    </div>

                    {/* Quick Stats Row */}
                    <div className="grid grid-cols-4 gap-px bg-gray-100 border-t border-gray-100">
                        {[
                            { label: 'Clients', value: stats.totalClients, color: 'text-blue-600' },
                            { label: 'Tasks', value: stats.totalTasks, color: 'text-green-600' },
                            { label: 'Earned', value: `₹${stats.totalEarned}`, color: 'text-purple-600' },
                            { label: 'Pending', value: `₹${stats.totalPending}`, color: 'text-orange-500' },
                        ].map((s) => (
                            <div key={s.label} className="py-4 text-center bg-white">
                                <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                                <p className="text-gray-400 text-xs mt-0.5">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 p-1 mb-6 bg-white border border-gray-100 shadow-sm rounded-xl w-fit">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-5 py-2 rounded-lg font-medium text-sm transition-all ${
                                activeTab === tab.id
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">

                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <form onSubmit={handleSaveProfile}>
                            <h3 className="mb-5 text-base font-bold text-gray-800">
                                Personal Information
                            </h3>
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-600 mb-1.5">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        placeholder="Your full name"
                                        className={inputClass}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-600 mb-1.5">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        placeholder="your@email.com"
                                        className={inputClass}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-600 mb-1.5">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={form.phone}
                                        onChange={handleChange}
                                        placeholder="+91 98765 43210"
                                        className={inputClass}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-600 mb-1.5">Location</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={form.address}
                                        onChange={handleChange}
                                        placeholder="City, Country"
                                        className={inputClass}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-600 mb-1.5">Skills</label>
                                    <input
                                        type="text"
                                        name="skills"
                                        value={form.skills}
                                        onChange={handleChange}
                                        placeholder="e.g. React, Design, Writing"
                                        className={inputClass}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-600 mb-1.5">Bio</label>
                                    <textarea
                                        name="bio"
                                        value={form.bio}
                                        onChange={handleChange}
                                        rows={3}
                                        placeholder="Tell clients about yourself..."
                                        className={`${inputClass} resize-none`}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end pt-5 mt-6 border-t border-gray-100">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition"
                                >
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <div>
                            <h3 className="mb-5 text-base font-bold text-gray-800">Change Password</h3>
                            <form onSubmit={handleSavePassword} className="max-w-md">
                                <div className="flex flex-col gap-4">
                                    {[
                                        { label: 'Current Password', name: 'currentPassword' },
                                        { label: 'New Password', name: 'newPassword' },
                                        { label: 'Confirm New Password', name: 'confirmPassword' },
                                    ].map((field) => (
                                        <div key={field.name}>
                                            <label className="block text-sm font-semibold text-gray-600 mb-1.5">
                                                {field.label}
                                            </label>
                                            <input
                                                type="password"
                                                name={field.name}
                                                value={passwordForm[field.name]}
                                                onChange={handlePasswordChange}
                                                placeholder="••••••••"
                                                className={inputClass}
                                            />
                                        </div>
                                    ))}
                                    <button
                                        type="submit"
                                        className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition mt-2"
                                    >
                                        Update Password
                                    </button>
                                </div>
                            </form>

                            {/* Tips */}
                            <div className="max-w-md p-5 mt-8 border border-blue-100 bg-blue-50 rounded-2xl">
                                <h4 className="mb-3 text-sm font-bold text-blue-700">🔐 Security Tips</h4>
                                {[
                                    'Use at least 8 characters',
                                    'Mix uppercase, lowercase & numbers',
                                    'Never share your password',
                                    'Change password every 3 months',
                                ].map((tip) => (
                                    <p key={tip} className="text-blue-600 text-sm flex items-center gap-2 mb-1.5">
                                        <span className="font-bold text-green-500">✓</span> {tip}
                                    </p>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Stats Tab */}
                    {activeTab === 'stats' && (
                        <div>
                            <h3 className="mb-5 text-base font-bold text-gray-800">Activity Overview</h3>
                            <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-4">
                                {[
                                    { label: 'Total Clients', value: stats.totalClients, icon: '👥', bg: 'bg-blue-50', color: 'text-blue-600' },
                                    { label: 'Total Tasks', value: stats.totalTasks, icon: '✅', bg: 'bg-green-50', color: 'text-green-600' },
                                    { label: 'Total Earned', value: `₹${stats.totalEarned}`, icon: '💰', bg: 'bg-purple-50', color: 'text-purple-600' },
                                    { label: 'Pending', value: `₹${stats.totalPending}`, icon: '⏳', bg: 'bg-orange-50', color: 'text-orange-500' },
                                ].map((s) => (
                                    <div key={s.label} className={`${s.bg} rounded-2xl p-5`}>
                                        <div className="mb-2 text-2xl">{s.icon}</div>
                                        <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                                        <p className="mt-1 text-xs text-gray-500">{s.label}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="p-6 text-center bg-gray-50 rounded-2xl">
                                <p className="mb-3 text-4xl">🚀</p>
                                <p className="text-lg font-bold text-gray-800">Keep it up!</p>
                                <p className="max-w-sm mx-auto mt-1 text-sm text-gray-400">
                                    You're building something great. Add more clients and tasks to grow!
                                </p>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

export default Profile;