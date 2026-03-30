import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, PieChart, Pie,
    Cell, LineChart, Line, Legend, Area, AreaChart
} from 'recharts';

function Dashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalClients: 0, totalTasks: 0,
        totalEarned: 0, totalPending: 0, totalOverdue: 0,
    });
    const [tasks, setTasks] = useState([]);
    const [allTasks, setAllTasks] = useState([]);
    const [recentPayments, setRecentPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [monthlyData, setMonthlyData] = useState([]); 

    const getGreeting = () => {
        const h = new Date().getHours();
        if (h < 12) return '🌅 Good Morning';
        if (h < 17) return '☀️ Good Afternoon';
        return '🌙 Good Evening';
    };

    const today = new Date().toLocaleDateString('en-IN', {
        weekday: 'long', year: 'numeric',
        month: 'long', day: 'numeric'
    });

    const isOverdue = (dueDate) => dueDate && new Date(dueDate) < new Date();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [clientsRes, tasksRes, paymentsRes, summaryRes, monthlyRes] = await Promise.all([
                    axios.get('/clients'),
                    axios.get('/tasks'),
                    axios.get('/payments'),
                    axios.get('/payments/summary'),
                    axios.get('/payments/monthly'), // ✅ NEW
                ]);

                setStats({
                    totalClients: clientsRes.data.length,
                    totalTasks: tasksRes.data.length,
                    totalEarned: summaryRes.data.totalEarned,
                    totalPending: summaryRes.data.totalPending,
                    totalOverdue: summaryRes.data.totalOverdue,
                });

                setAllTasks(tasksRes.data);
                setTasks(tasksRes.data.filter(t => t.status !== 'Done').slice(0, 5));
                setRecentPayments(paymentsRes.data.slice(0, 4));
                setMonthlyData(monthlyRes.data); // ✅ NEW

                const notifs = [];
                const overdueTasks = tasksRes.data.filter(t =>
                    t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Done'
                );
                if (overdueTasks.length > 0) {
                    notifs.push({ type: 'error', message: `${overdueTasks.length} task(s) are overdue!`, link: '/tasks' });
                }
                if (summaryRes.data.totalOverdue > 0) {
                    notifs.push({ type: 'warning', message: `₹${summaryRes.data.totalOverdue} in overdue payments`, link: '/payments' });
                }
                if (summaryRes.data.totalPending > 0) {
                    notifs.push({ type: 'info', message: `₹${summaryRes.data.totalPending} pending payment(s)`, link: '/payments' });
                }
                if (clientsRes.data.length === 0) {
                    notifs.push({ type: 'info', message: 'Add your first client to get started!', link: '/clients' });
                }
                setNotifications(notifs);

            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const taskStatusData = [
        { name: 'To-Do', value: allTasks.filter(t => t.status === 'To-Do').length, color: '#94A3B8' },
        { name: 'In Progress', value: allTasks.filter(t => t.status === 'In Progress').length, color: '#3B82F6' },
        { name: 'Done', value: allTasks.filter(t => t.status === 'Done').length, color: '#10B981' },
    ];

    const paymentChartData = [
        { name: 'Earned', amount: stats.totalEarned, fill: '#10B981' },
        { name: 'Pending', amount: stats.totalPending, fill: '#F59E0B' },
        { name: 'Overdue', amount: stats.totalOverdue, fill: '#EF4444' },
    ];

    const completedTasks = allTasks.filter(t => t.status === 'Done').length;
    const progressPercent = allTasks.length > 0
        ? Math.round((completedTasks / allTasks.length) * 100)
        : 0;

   
    const currentMonthEarned = monthlyData[monthlyData.length - 1]?.earned || 0;
    const lastMonthEarned = monthlyData[monthlyData.length - 2]?.earned || 0;
    const trendPercent = lastMonthEarned === 0
        ? 100
        : Math.round(((currentMonthEarned - lastMonthEarned) / lastMonthEarned) * 100);
    const trendUp = trendPercent >= 0;

    const priorityColor = (p) => ({
        'High': 'bg-red-100 text-red-600',
        'Medium': 'bg-yellow-100 text-yellow-700',
        'Low': 'bg-green-100 text-green-600',
    }[p] || 'bg-gray-100 text-gray-600');

    const statusColor = (s) => ({
        'To-Do': 'bg-gray-100 text-gray-500',
        'In Progress': 'bg-blue-100 text-blue-600',
        'Done': 'bg-green-100 text-green-600',
    }[s] || 'bg-gray-100 text-gray-500');

    const notifColor = (type) => ({
        'error': 'bg-red-50 border-red-200 text-red-700',
        'warning': 'bg-yellow-50 border-yellow-200 text-yellow-700',
        'info': 'bg-blue-50 border-blue-200 text-blue-700',
    }[type]);

    const notifIcon = (type) => ({
        'error': '🚨', 'warning': '⚠️', 'info': 'ℹ️'
    }[type]);

   
    const MonthlyTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="px-4 py-3 bg-white border border-gray-100 shadow-xl rounded-2xl">
                    <p className="mb-1 text-xs font-bold text-gray-500">{label}</p>
                    <p className="text-base font-black text-purple-600">₹{payload[0].value.toLocaleString('en-IN')}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 p-8 ml-64">

                {/* HEADER */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <p className="mb-1 text-sm font-medium text-blue-500">
                            {getGreeting()}, {user?.name}!
                        </p>
                        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                        <p className="mt-1 text-sm text-gray-400">{today}</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative flex items-center justify-center w-10 h-10 transition bg-white border border-gray-200 shadow-sm rounded-xl hover:bg-gray-50"
                            >
                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                {notifications.length > 0 && (
                                    <span className="absolute flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full -top-1 -right-1">
                                        {notifications.length}
                                    </span>
                                )}
                            </button>

                            {showNotifications && (
                                <div className="absolute right-0 z-50 overflow-hidden bg-white border border-gray-100 shadow-xl top-12 w-80 rounded-2xl">
                                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                                        <h3 className="text-sm font-bold text-gray-800">Notifications</h3>
                                        <span className="text-xs text-gray-400">{notifications.length} alerts</span>
                                    </div>
                                    {notifications.length === 0 ? (
                                        <div className="p-6 text-center">
                                            <p className="mb-1 text-2xl">🎉</p>
                                            <p className="text-sm text-gray-400">All caught up!</p>
                                        </div>
                                    ) : (
                                        <div className="overflow-y-auto max-h-64">
                                            {notifications.map((n, i) => (
                                                <Link
                                                    key={i}
                                                    to={n.link}
                                                    onClick={() => setShowNotifications(false)}
                                                    className={`flex items-center gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition ${notifColor(n.type)}`}
                                                >
                                                    <span>{notifIcon(n.type)}</span>
                                                    <p className="text-sm font-medium">{n.message}</p>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="px-5 py-3 text-center bg-white border border-gray-100 shadow-sm rounded-xl">
                            <p className="text-xs font-medium text-gray-400">Platform Health</p>
                            <p className={`text-lg font-black mt-0.5 ${
                                stats.totalOverdue > 0 ? 'text-red-500' :
                                stats.totalPending > 0 ? 'text-yellow-500' : 'text-green-500'
                            }`}>
                                {stats.totalOverdue > 0 ? '⚠️ Alert' :
                                 stats.totalPending > 0 ? '🔔 Good' : '✅ Great'}
                            </p>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="mb-3 text-4xl animate-bounce">⏳</div>
                            <p className="text-gray-400">Loading your workspace...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* STATS CARDS */}
                        <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-4">
                            {[
                                { label: 'Total Clients', value: stats.totalClients, icon: '👥', color: 'text-blue-600', bg: 'bg-blue-50', tag: 'Clients', tagColor: 'text-blue-500 bg-blue-50' },
                                { label: 'Total Tasks', value: stats.totalTasks, icon: '✅', color: 'text-green-600', bg: 'bg-green-50', tag: 'Tasks', tagColor: 'text-green-500 bg-green-50' },
                                { label: 'Total Earned', value: `₹${stats.totalEarned}`, icon: '💰', color: 'text-white', bg: 'bg-gradient-to-br from-purple-500 to-purple-600', tag: 'Earned', tagColor: 'text-white bg-white bg-opacity-20', gradient: true },
                                { label: 'Pending', value: `₹${stats.totalPending}`, icon: '⏳', color: 'text-white', bg: 'bg-gradient-to-br from-orange-400 to-orange-500', tag: 'Pending', tagColor: 'text-white bg-white bg-opacity-20', gradient: true },
                            ].map((card) => (
                                <div key={card.label} className={`${card.bg} rounded-2xl p-5 shadow-sm hover:shadow-md transition`}>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className={`w-10 h-10 ${card.gradient ? 'bg-white bg-opacity-20' : card.bg} rounded-xl flex items-center justify-center text-xl`}>
                                            {card.icon}
                                        </div>
                                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${card.tagColor}`}>
                                            {card.tag}
                                        </span>
                                    </div>
                                    <p className={`text-3xl font-black ${card.color}`}>{card.value}</p>
                                    <p className={`text-sm mt-1 ${card.gradient ? 'text-white text-opacity-80' : 'text-gray-400'}`}>
                                        {card.label}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* TASK PROGRESS BAR */}
                        <div className="p-6 mb-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <h3 className="font-bold text-gray-800">Task Completion Progress</h3>
                                    <p className="text-gray-400 text-sm mt-0.5">
                                        {completedTasks} of {allTasks.length} tasks completed
                                    </p>
                                </div>
                                <span className={`text-2xl font-black ${
                                    progressPercent === 100 ? 'text-green-500' :
                                    progressPercent > 50 ? 'text-blue-500' : 'text-orange-500'
                                }`}>
                                    {progressPercent}%
                                </span>
                            </div>
                            <div className="w-full h-3 overflow-hidden bg-gray-100 rounded-full">
                                <div
                                    className={`h-full rounded-full transition-all duration-700 ${
                                        progressPercent === 100 ? 'bg-green-500' :
                                        progressPercent > 50 ? 'bg-blue-500' : 'bg-orange-400'
                                    }`}
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                            <div className="flex justify-between mt-2">
                                {taskStatusData.map(s => (
                                    <div key={s.name} className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                                        <span className="text-xs text-gray-400">{s.name}: {s.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ALERT BANNER */}
                        {stats.totalOverdue > 0 && (
                            <div className="flex items-center gap-3 p-4 mb-6 border border-red-200 bg-red-50 rounded-2xl">
                                <span className="text-2xl">🚨</span>
                                <div className="flex-1">
                                    <p className="font-bold text-red-700">Action Required!</p>
                                    <p className="text-sm text-red-500">₹{stats.totalOverdue} in overdue payments — follow up with clients!</p>
                                </div>
                                <Link to="/payments" className="px-4 py-2 text-sm font-medium text-white transition bg-red-500 rounded-lg hover:bg-red-600">
                                    View Now
                                </Link>
                            </div>
                        )}

                        {/* ✅ NEW: MONTHLY REVENUE TREND CHART */}
                        <div className="p-6 mb-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
                            <div className="flex items-center justify-between mb-1">
                                <div>
                                    <h3 className="font-bold text-gray-800">📈 Monthly Revenue Trend</h3>
                                    <p className="text-xs text-gray-400 mt-0.5">Earnings over the last 6 months</p>
                                </div>
                                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold ${
                                    trendUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
                                }`}>
                                    <span>{trendUp ? '↑' : '↓'}</span>
                                    <span>{Math.abs(trendPercent)}% vs last month</span>
                                </div>
                            </div>

                            {/* Summary row */}
                            <div className="flex gap-6 mt-3 mb-4">
                                <div>
                                    <p className="text-xs text-gray-400">This Month</p>
                                    <p className="text-lg font-black text-purple-600">₹{currentMonthEarned.toLocaleString('en-IN')}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">Last Month</p>
                                    <p className="text-lg font-black text-gray-500">₹{lastMonthEarned.toLocaleString('en-IN')}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">6-Month Total</p>
                                    <p className="text-lg font-black text-gray-800">
                                        ₹{monthlyData.reduce((sum, m) => sum + m.earned, 0).toLocaleString('en-IN')}
                                    </p>
                                </div>
                            </div>

                            <ResponsiveContainer width="100%" height={220}>
                                <AreaChart data={monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                                    <XAxis
                                        dataKey="month"
                                        tick={{ fontSize: 12, fill: '#94A3B8' }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 12, fill: '#94A3B8' }}
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={(v) => `₹${v}`}
                                    />
                                    <Tooltip content={<MonthlyTooltip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="earned"
                                        stroke="#8B5CF6"
                                        strokeWidth={3}
                                        fill="url(#earningsGradient)"
                                        dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 5 }}
                                        activeDot={{ r: 7, fill: '#8B5CF6' }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        {/* CHARTS ROW */}
                        <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-3">

                            <div className="p-6 bg-white border border-gray-100 shadow-sm md:col-span-2 rounded-2xl">
                                <h3 className="mb-1 font-bold text-gray-800">Payment Overview</h3>
                                <p className="mb-4 text-xs text-gray-400">Earned vs Pending vs Overdue</p>
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={paymentChartData} barSize={50}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                                            formatter={(value) => [`₹${value}`, 'Amount']}
                                        />
                                        <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                                            {paymentChartData.map((entry, index) => (
                                                <Cell key={index} fill={entry.fill} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
                                <h3 className="mb-1 font-bold text-gray-800">Task Status</h3>
                                <p className="mb-2 text-xs text-gray-400">Distribution by status</p>
                                {allTasks.length === 0 ? (
                                    <div className="flex items-center justify-center h-40">
                                        <p className="text-sm text-gray-400">No tasks yet</p>
                                    </div>
                                ) : (
                                    <>
                                        <ResponsiveContainer width="100%" height={160}>
                                            <PieChart>
                                                <Pie
                                                    data={taskStatusData}
                                                    cx="50%" cy="50%"
                                                    innerRadius={45}
                                                    outerRadius={70}
                                                    paddingAngle={4}
                                                    dataKey="value"
                                                >
                                                    {taskStatusData.map((entry, index) => (
                                                        <Cell key={index} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="flex flex-col gap-1.5 mt-2">
                                            {taskStatusData.map(s => (
                                                <div key={s.name} className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                                                        <span className="text-xs text-gray-500">{s.name}</span>
                                                    </div>
                                                    <span className="text-xs font-bold text-gray-700">{s.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* PENDING TASKS + RECENT PAYMENTS */}
                        <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-2">
                            <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-gray-800">📋 Pending Tasks</h3>
                                    <Link to="/tasks" className="text-sm text-blue-500 hover:underline">View all →</Link>
                                </div>
                                {tasks.length === 0 ? (
                                    <div className="py-8 text-center">
                                        <p className="mb-2 text-3xl">🎉</p>
                                        <p className="text-sm text-gray-400">All tasks completed!</p>
                                    </div>
                                ) : (
                                    tasks.map(task => (
                                        <div key={task._id} className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
                                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isOverdue(task.dueDate) ? 'bg-red-500' : 'bg-blue-400'}`} />
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
                                            <div className="flex gap-1.5 flex-shrink-0">
                                                <span className={`text-xs px-2 py-1 rounded-full ${priorityColor(task.priority)}`}>{task.priority}</span>
                                                <span className={`text-xs px-2 py-1 rounded-full ${statusColor(task.status)}`}>{task.status}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-gray-800">💳 Recent Payments</h3>
                                    <Link to="/payments" className="text-sm text-blue-500 hover:underline">View all →</Link>
                                </div>
                                {recentPayments.length === 0 ? (
                                    <div className="py-8 text-center">
                                        <p className="mb-2 text-3xl">💸</p>
                                        <p className="text-sm text-gray-400">No payments yet!</p>
                                    </div>
                                ) : (
                                    recentPayments.map(payment => (
                                        <div key={payment._id} className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
                                            <div className="flex items-center justify-center flex-shrink-0 text-base w-9 h-9 bg-purple-50 rounded-xl">
                                                💰
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-800 truncate">{payment.client?.name}</p>
                                                <p className="text-xs text-gray-400">
                                                    {payment.description || 'Service Payment'} · {new Date(payment.date).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="flex-shrink-0 text-right">
                                                <p className="text-sm font-bold text-gray-800">₹{payment.amount}</p>
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                    payment.status === 'Paid' ? 'bg-green-100 text-green-600' :
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

                        {/* QUICK ACTIONS */}
                        <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
                            <h3 className="mb-4 text-base font-bold text-gray-800">⚡ Quick Actions</h3>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <Link to="/clients" className="flex items-center gap-4 p-4 transition group bg-blue-50 rounded-xl hover:bg-blue-100">
                                    <div className="flex items-center justify-center text-xl transition bg-blue-500 shadow-sm w-11 h-11 rounded-xl group-hover:scale-110">👥</div>
                                    <div>
                                        <p className="text-sm font-bold text-blue-700">Manage Clients</p>
                                        <p className="text-xs text-blue-400">{stats.totalClients} clients</p>
                                    </div>
                                </Link>
                                <Link to="/tasks" className="flex items-center gap-4 p-4 transition group bg-green-50 rounded-xl hover:bg-green-100">
                                    <div className="flex items-center justify-center text-xl transition bg-green-500 shadow-sm w-11 h-11 rounded-xl group-hover:scale-110">✅</div>
                                    <div>
                                        <p className="text-sm font-bold text-green-700">Manage Tasks</p>
                                        <p className="text-xs text-green-400">{stats.totalTasks} tasks</p>
                                    </div>
                                </Link>
                                <Link to="/payments" className="flex items-center gap-4 p-4 transition group bg-purple-50 rounded-xl hover:bg-purple-100">
                                    <div className="flex items-center justify-center text-xl transition bg-purple-500 shadow-sm w-11 h-11 rounded-xl group-hover:scale-110">💰</div>
                                    <div>
                                        <p className="text-sm font-bold text-purple-700">Manage Payments</p>
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