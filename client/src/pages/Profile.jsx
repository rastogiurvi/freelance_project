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
        name: '',
        email: '',
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
        const fetchAll = async () => {
            try {
                const [clientsRes, tasksRes, summaryRes, profileRes] = await Promise.all([
                    axios.get('/clients'),
                    axios.get('/tasks'),
                    axios.get('/payments/summary'),
                    axios.get('/auth/profile'),
                ]);

                setStats({
                    totalClients: clientsRes.data.length,
                    totalTasks: tasksRes.data.length,
                    totalEarned: summaryRes.data.totalEarned,
                    totalPending: summaryRes.data.totalPending,
                });

                const p = profileRes.data.user;
                setForm({
                    name: p.name || '',
                    email: p.email || '',
                    phone: p.phone || '',
                    address: p.address || '',
                    bio: p.bio || '',
                    skills: p.skills || '',
                });

            } catch (error) {
                console.error(error);
            }
        };
        fetchAll();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.put('/auth/profile', {
                name: form.name,
                email: form.email,
                phone: form.phone,
                address: form.address,
                bio: form.bio,
                skills: form.skills,
            });
            const token = localStorage.getItem('token');
            login(token, res.data.user || { ...user, name: form.name, email: form.email });
            toast.success('Profile saved! ✅');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save profile!');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = (e) => {
        setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
    };

    const handleSavePassword = async (e) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error('Passwords do not match!');
            return;
        }
        if (passwordForm.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters!');
            return;
        }
        setLoading(true);
        try {
            await axios.put('/auth/change-password', {
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword,
            });
            toast.success('Password updated! 🔐');
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update password!');
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'profile', label: '👤 Profile Info' },
        { id: 'security', label: '🔐 Security' },
        { id: 'stats', label: '📊 My Stats' },
    ];

    const inputClass = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm font-medium";

    const initials = user?.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : '?';

    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar />
            <div className="flex-1 p-8 ml-64">

                <div className="mb-8">
                    <p className="mb-1 text-sm font-semibold text-indigo-500">Account Settings</p>
                    <h1 className="text-3xl font-black text-gray-900">Your Profile</h1>
                    <p className="mt-1 text-sm text-gray-400">Manage your personal information and preferences</p>
                </div>

                {/* Profile Hero Card */}
                <div className="mb-6 overflow-hidden bg-white border border-gray-100 shadow-sm rounded-3xl">

                    {/* Banner */}
                    <div className="relative h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
                        <div className="absolute w-20 h-20 bg-white rounded-full top-4 right-8 opacity-10" />
                        <div className="absolute w-32 h-32 bg-white rounded-full -top-4 right-24 opacity-5" />
                        <div className="absolute w-10 h-10 bg-white rounded-full top-6 right-40 opacity-10" />
                    </div>

                    {/* Avatar + Info */}
                    <div className="relative px-8 pb-6">
                        <div className="absolute -top-10 left-8">
                            <div className="flex items-center justify-center w-20 h-20 border-4 border-white shadow-lg rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600">
                                <span className="text-2xl font-black text-white">{initials}</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between pt-14">
                            <div>
                                <h2 className="text-xl font-black text-gray-900">{user?.name}</h2>
                                <p className="text-sm text-gray-400 mt-0.5">{user?.email}</p>
                            </div>
                            <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-sm">
                                ✦ Freelancer
                            </span>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-4 gap-px bg-gray-100 border-t border-gray-100">
                        {[
                            { label: 'Clients', value: stats.totalClients, color: 'text-indigo-600', icon: '👥' },
                            { label: 'Tasks', value: stats.totalTasks, color: 'text-emerald-600', icon: '✅' },
                            { label: 'Earned', value: `₹${stats.totalEarned}`, color: 'text-purple-600', icon: '💰' },
                            { label: 'Pending', value: `₹${stats.totalPending}`, color: 'text-amber-500', icon: '⏳' },
                        ].map((s) => (
                            <div key={s.label} className="py-5 text-center transition bg-white hover:bg-slate-50">
                                <p className="text-lg mb-0.5">{s.icon}</p>
                                <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                                <p className="text-gray-400 text-xs mt-0.5 font-medium">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 p-1.5 mb-6 bg-white border border-gray-100 shadow-sm rounded-2xl w-fit">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                                activeTab === tab.id
                                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md scale-[1.02]'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="p-8 bg-white border border-gray-100 shadow-sm rounded-3xl">

                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <form onSubmit={handleSaveProfile}>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-1 h-6 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500" />
                                <h3 className="text-base font-black text-gray-800">Personal Information</h3>
                            </div>
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <div>
                                    <label className="block mb-2 text-xs font-bold tracking-wider text-gray-500 uppercase">Full Name</label>
                                    <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Your full name" className={inputClass} />
                                </div>
                                <div>
                                    <label className="block mb-2 text-xs font-bold tracking-wider text-gray-500 uppercase">Email Address</label>
                                    <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="your@email.com" className={inputClass} />
                                </div>
                                <div>
                                    <label className="block mb-2 text-xs font-bold tracking-wider text-gray-500 uppercase">Phone Number</label>
                                    <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" className={inputClass} />
                                </div>
                                <div>
                                    <label className="block mb-2 text-xs font-bold tracking-wider text-gray-500 uppercase">Location</label>
                                    <input type="text" name="address" value={form.address} onChange={handleChange} placeholder="City, Country" className={inputClass} />
                                </div>
                                <div>
                                    <label className="block mb-2 text-xs font-bold tracking-wider text-gray-500 uppercase">Skills</label>
                                    <input type="text" name="skills" value={form.skills} onChange={handleChange} placeholder="e.g. React, Design, Writing" className={inputClass} />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block mb-2 text-xs font-bold tracking-wider text-gray-500 uppercase">Bio</label>
                                    <textarea name="bio" value={form.bio} onChange={handleChange} rows={3} placeholder="Tell clients about yourself..." className={`${inputClass} resize-none`} />
                                </div>
                            </div>
                            <div className="flex justify-end pt-6 mt-6 border-t border-gray-100">
                                <button type="submit" disabled={loading} className="px-8 py-3 text-sm font-bold text-white transition shadow-md bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl hover:opacity-90 disabled:opacity-60">
                                    {loading ? '⏳ Saving...' : '✅ Save Changes'}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-1 h-6 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500" />
                                <h3 className="text-base font-black text-gray-800">Change Password</h3>
                            </div>
                            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                                <form onSubmit={handleSavePassword}>
                                    <div className="flex flex-col gap-4">
                                        {[
                                            { label: 'Current Password', name: 'currentPassword', placeholder: 'Enter current password' },
                                            { label: 'New Password', name: 'newPassword', placeholder: 'Min. 6 characters' },
                                            { label: 'Confirm New Password', name: 'confirmPassword', placeholder: 'Repeat new password' },
                                        ].map((field) => (
                                            <div key={field.name}>
                                                <label className="block mb-2 text-xs font-bold tracking-wider text-gray-500 uppercase">{field.label}</label>
                                                <input type="password" name={field.name} value={passwordForm[field.name]} onChange={handlePasswordChange} placeholder={field.placeholder} className={inputClass} />
                                            </div>
                                        ))}
                                        <button type="submit" disabled={loading} className="w-full py-3 mt-2 text-sm font-bold text-white transition shadow-md bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl hover:opacity-90 disabled:opacity-60">
                                            {loading ? '⏳ Updating...' : '🔐 Update Password'}
                                        </button>
                                    </div>
                                </form>
                                <div className="p-6 border border-indigo-100 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl h-fit">
                                    <h4 className="mb-4 text-sm font-black text-indigo-700">🔐 Security Tips</h4>
                                    {[
                                        'Use at least 8 characters',
                                        'Mix uppercase, lowercase & numbers',
                                        'Add special characters like !@#$',
                                        'Never share your password',
                                        'Change password every 3 months',
                                    ].map((tip) => (
                                        <p key={tip} className="text-indigo-600 text-sm flex items-center gap-2 mb-2.5 font-medium">
                                            <span className="flex items-center justify-center flex-shrink-0 w-5 h-5 text-xs text-white rounded-full bg-emerald-400">✓</span>
                                            {tip}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Stats Tab */}
                    {activeTab === 'stats' && (
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-1 h-6 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500" />
                                <h3 className="text-base font-black text-gray-800">Activity Overview</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-4">
                                {[
                                    { label: 'Total Clients', value: stats.totalClients, icon: '👥', from: 'from-blue-400', to: 'to-indigo-500' },
                                    { label: 'Total Tasks', value: stats.totalTasks, icon: '✅', from: 'from-emerald-400', to: 'to-teal-500' },
                                    { label: 'Total Earned', value: `₹${stats.totalEarned}`, icon: '💰', from: 'from-purple-400', to: 'to-pink-500' },
                                    { label: 'Pending', value: `₹${stats.totalPending}`, icon: '⏳', from: 'from-amber-400', to: 'to-orange-500' },
                                ].map((s) => (
                                    <div key={s.label} className={`bg-gradient-to-br ${s.from} ${s.to} rounded-2xl p-5 text-white shadow-md`}>
                                        <div className="mb-2 text-2xl">{s.icon}</div>
                                        <p className="text-2xl font-black">{s.value}</p>
                                        <p className="mt-1 text-xs font-semibold text-white opacity-80">{s.label}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="p-8 text-center border border-indigo-100 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl">
                                <p className="mb-4 text-5xl">🚀</p>
                                <p className="text-xl font-black text-gray-800">Keep it up, {user?.name?.split(' ')[0]}!</p>
                                <p className="max-w-sm mx-auto mt-2 text-sm font-medium text-gray-500">
                                    You're building something great. Add more clients and tasks to grow your freelance business!
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