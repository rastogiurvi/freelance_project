import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalClients: 0,
        totalTasks: 0,
        totalEarned: 0,
        totalPending: 0,
        totalOverdue: 0,
    });
    const [tasks, setTasks] = useState([]);
    const [recentPayments, setRecentPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    // Smart greeting based on time of day
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return '🌅 Good Morning';
        if (hour < 17) return '☀️ Good Afternoon';
        return '🌙 Good Evening';
    };

    // Smart date display
    const today = new Date().toLocaleDateString('en-IN', {
        weekday: 'long', year: 'numeric',
        month: 'long', day: 'numeric'
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [clientsRes, tasksRes, paymentsRes, summaryRes] = await Promise.all([
                    axios.get('/clients'),
                    axios.get('/tasks'),
                    axios.get('/payments'),
                    axios.get('/payments/summary'),
                ]);

                setStats({
                    totalClients: clientsRes.data.length,
                    totalTasks: tasksRes.data.length,
                    totalEarned: summaryRes.data.totalEarned,
                    totalPending: summaryRes.data.totalPending,
                    totalOverdue: summaryRes.data.totalOverdue,
                });

                // Smart — show only pending/in-progress tasks
                setTasks(tasksRes.data.filter(t => t.status !== 'Done').slice(0, 5));

                // Smart — show 3 most recent payments
                setRecentPayments(paymentsRes.data.slice(0, 3));

            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    // Smart — auto detect overdue tasks by comparing dates
    const isOverdue = (dueDate) => {
        if (!dueDate) return false;
        return new Date(dueDate) < new Date();
    };

    const priorityColor = (p) => ({
        'High':   'bg-red-100 text-red-600',
        'Medium': 'bg-yellow-100 text-yellow-700',
        'Low':    'bg-green-100 text-green-600',
    }[p] || 'bg-gray-100 text-gray-600');

    const statusColor = (s) => ({
        'To-Do':       'bg-gray-100 text-gray-500',
        'In Progress': 'bg-blue-100 text-blue-600',
        'Done':        'bg-green-100 text-green-600',
    }[s] || 'bg-gray-100 text-gray-500');

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />

            <div className="flex-1 p-8 ml-64">

                {/* ── HEADER ─────────────────────────────── */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <p className="mb-1 text-sm font-medium text-blue-500">
                            {getGreeting()}, {user?.name}! 👋
                        </p>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Dashboard
                        </h1>
                        <p className="mt-1 text-sm text-gray-400">{today}</p>
                    </div>

                    {/* Smart — Platform Health Score */}
                    <div className="px-6 py-4 text-center bg-white border border-gray-100 shadow-sm rounded-2xl">
                        <p className="mb-1 text-xs font-medium text-gray-400">
                            Platform Health
                        </p>
                        <p className={`text-2xl font-black ${
                            stats.totalOverdue > 0 ? 'text-red-500' :
                            stats.totalPending > 0 ? 'text-yellow-500' :
                            'text-green-500'
                        }`}>
                            {stats.totalOverdue > 0 ? '⚠️ Alert' :
                             stats.totalPending > 0 ? '🔔 Good' : '✅ Great'}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                            {stats.totalOverdue > 0
                                ? `₹${stats.totalOverdue} overdue`
                                : 'All on track!'}
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="mb-3 text-4xl">⏳</div>
                            <p className="text-gray-400">Loading your workspace...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* ── STATS CARDS ───────────────────────── */}
                        <div className="grid grid-cols-2 gap-4 mb-8 md:grid-cols-4">

                            <div className="p-5 transition bg-white border border-gray-100 shadow-sm rounded-2xl hover:shadow-md">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center justify-center w-10 h-10 text-xl bg-blue-50 rounded-xl">👥</div>
                                    <span className="px-2 py-1 text-xs font-medium text-blue-500 rounded-full bg-blue-50">Clients</span>
                                </div>
                                <p className="text-3xl font-black text-gray-800">{stats.totalClients}</p>
                                <p className="mt-1 text-sm text-gray-400">Total Clients</p>
                            </div>

                            <div className="p-5 transition bg-white border border-gray-100 shadow-sm rounded-2xl hover:shadow-md">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center justify-center w-10 h-10 text-xl bg-green-50 rounded-xl">✅</div>
                                    <span className="px-2 py-1 text-xs font-medium text-green-500 rounded-full bg-green-50">Tasks</span>
                                </div>
                                <p className="text-3xl font-black text-gray-800">{stats.totalTasks}</p>
                                <p className="mt-1 text-sm text-gray-400">Total Tasks</p>
                            </div>

                            <div className="p-5 transition shadow-sm bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl hover:shadow-md">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center justify-center w-10 h-10 text-xl bg-white bg-opacity-20 rounded-xl">💰</div>
                                    <span className="px-2 py-1 text-xs font-medium text-white bg-white rounded-full bg-opacity-20">Earned</span>
                                </div>
                                <p className="text-3xl font-black text-white">₹{stats.totalEarned}</p>
                                <p className="mt-1 text-sm text-purple-200">Total Earned</p>
                            </div>

                            <div className={`rounded-2xl p-5 shadow-sm hover:shadow-md transition ${
                                stats.totalOverdue > 0
                                    ? 'bg-gradient-to-br from-red-500 to-red-600'
                                    : 'bg-gradient-to-br from-orange-400 to-orange-500'
                            }`}>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center justify-center w-10 h-10 text-xl bg-white bg-opacity-20 rounded-xl">
                                        {stats.totalOverdue > 0 ? '🚨' : '⏳'}
                                    </div>
                                    <span className="px-2 py-1 text-xs font-medium text-white bg-white rounded-full bg-opacity-20">
                                        {stats.totalOverdue > 0 ? 'Overdue' : 'Pending'}
                                    </span>
                                </div>
                                <p className="text-3xl font-black text-white">
                                    ₹{stats.totalOverdue > 0 ? stats.totalOverdue : stats.totalPending}
                                </p>
                                <p className="mt-1 text-sm text-orange-100">
                                    {stats.totalOverdue > 0 ? 'Overdue Amount' : 'Pending Amount'}
                                </p>
                            </div>

                        </div>

                        {/* ── SMART ALERT BANNER ────────────────── */}
                        {stats.totalOverdue > 0 && (
                            <div className="flex items-center gap-3 p-4 mb-6 border border-red-200 bg-red-50 rounded-2xl">
                                <span className="text-2xl">🚨</span>
                                <div className="flex-1">
                                    <p className="font-bold text-red-700">Action Required!</p>
                                    <p className="text-sm text-red-500">
                                        You have ₹{stats.totalOverdue} in overdue payments. Follow up with your clients!
                                    </p>
                                </div>
                                <Link
                                    to="/payments"
                                    className="px-4 py-2 text-sm font-medium text-white transition bg-red-500 rounded-lg hover:bg-red-600"
                                >
                                    View Now
                                </Link>
                            </div>
                        )}

                        {/* ── TWO COLUMN LAYOUT ─────────────────── */}
                        <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-2">

                            {/* Pending Tasks Widget */}
                            <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-gray-800">
                                        📋 Pending Tasks
                                    </h3>
                                    <Link to="/tasks" className="text-sm text-blue-500 hover:underline">
                                        View all →
                                    </Link>
                                </div>

                                {tasks.length === 0 ? (
                                    <div className="py-8 text-center">
                                        <p className="mb-2 text-3xl">🎉</p>
                                        <p className="text-sm text-gray-400">All tasks completed!</p>
                                    </div>
                                ) : (
                                    tasks.map(task => (
                                        <div key={task._id} className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
                                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                                isOverdue(task.dueDate) ? 'bg-red-500' : 'bg-blue-400'
                                            }`} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-800 truncate">
                                                    {task.title}
                                                    {isOverdue(task.dueDate) && (
                                                        <span className="ml-2 text-xs font-bold text-red-500">OVERDUE</span>
                                                    )}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {task.client?.name}
                                                    {task.dueDate && ` · Due ${new Date(task.dueDate).toLocaleDateString()}`}
                                                </p>
                                            </div>
                                            <div className="flex flex-shrink-0 gap-2">
                                                <span className={`text-xs px-2 py-1 rounded-full ${priorityColor(task.priority)}`}>
                                                    {task.priority}
                                                </span>
                                                <span className={`text-xs px-2 py-1 rounded-full ${statusColor(task.status)}`}>
                                                    {task.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Recent Payments Widget */}
                            <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-gray-800">
                                        💳 Recent Payments
                                    </h3>
                                    <Link to="/payments" className="text-sm text-blue-500 hover:underline">
                                        View all →
                                    </Link>
                                </div>

                                {recentPayments.length === 0 ? (
                                    <div className="py-8 text-center">
                                        <p className="mb-2 text-3xl">💸</p>
                                        <p className="text-sm text-gray-400">No payments yet!</p>
                                    </div>
                                ) : (
                                    recentPayments.map(payment => (
                                        <div key={payment._id} className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
                                            <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 text-lg bg-purple-50 rounded-xl">
                                                💰
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-800 truncate">
                                                    {payment.client?.name}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {payment.description || 'Service Payment'} · {new Date(payment.date).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="flex-shrink-0 text-right">
                                                <p className="font-bold text-gray-800">₹{payment.amount}</p>
                                                <span className={`text-xs px-2 py-1 rounded-full ${
                                                    payment.status === 'Paid'    ? 'bg-green-100 text-green-600' :
                                                    payment.status === 'Pending' ? 'bg-yellow-100 text-yellow-600' :
                                                    'bg-red-100 text-red-600'
                                                }`}>
                                                    {payment.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                        </div>

                        {/* ── QUICK ACTIONS ─────────────────────── */}
                        <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
                            <h3 className="mb-4 text-lg font-bold text-gray-800">
                                ⚡ Quick Actions
                            </h3>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <Link to="/clients" className="flex items-center gap-4 p-4 transition group bg-blue-50 rounded-xl hover:bg-blue-100">
                                    <div className="flex items-center justify-center w-12 h-12 text-2xl transition bg-blue-500 shadow-sm rounded-xl group-hover:scale-110">
                                        👥
                                    </div>
                                    <div>
                                        <p className="font-bold text-blue-700">Manage Clients</p>
                                        <p className="text-xs text-blue-400">{stats.totalClients} clients</p>
                                    </div>
                                </Link>
                                <Link to="/tasks" className="flex items-center gap-4 p-4 transition group bg-green-50 rounded-xl hover:bg-green-100">
                                    <div className="flex items-center justify-center w-12 h-12 text-2xl transition bg-green-500 shadow-sm rounded-xl group-hover:scale-110">
                                        ✅
                                    </div>
                                    <div>
                                        <p className="font-bold text-green-700">Manage Tasks</p>
                                        <p className="text-xs text-green-400">{stats.totalTasks} tasks</p>
                                    </div>
                                </Link>
                                <Link to="/payments" className="flex items-center gap-4 p-4 transition group bg-purple-50 rounded-xl hover:bg-purple-100">
                                    <div className="flex items-center justify-center w-12 h-12 text-2xl transition bg-purple-500 shadow-sm rounded-xl group-hover:scale-110">
                                        💰
                                    </div>
                                    <div>
                                        <p className="font-bold text-purple-700">Manage Payments</p>
                                        <p className="text-xs text-purple-400">₹{stats.totalEarned} earned</p>
                                    </div>
                                </Link>
                            </div>
                        </div>

                    </>
                )}
            </div>
        </div>
    );
}

export default Dashboard;