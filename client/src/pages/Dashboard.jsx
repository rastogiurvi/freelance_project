import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import axios from '../api/axios';

function Dashboard() {
    const [stats, setStats] = useState({
        totalClients: 0,
        totalTasks: 0,
        totalEarned: 0,
        totalPending: 0,
        totalOverdue: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [clientsRes, tasksRes, paymentsRes] = await Promise.all([
                    axios.get('/clients'),
                    axios.get('/tasks'),
                    axios.get('/payments/summary'),
                ]);

                setStats({
                    totalClients: clientsRes.data.length,
                    totalTasks: tasksRes.data.length,
                    totalEarned: paymentsRes.data.totalEarned,
                    totalPending: paymentsRes.data.totalPending,
                    totalOverdue: paymentsRes.data.totalOverdue,
                });
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const cards = [
        { label: 'Total Clients',  value: stats.totalClients,          color: 'text-blue-600',   bg: 'bg-blue-50',   icon: '👥' },
        { label: 'Total Tasks',    value: stats.totalTasks,            color: 'text-green-600',  bg: 'bg-green-50',  icon: '✅' },
        { label: 'Total Earned',   value: `₹${stats.totalEarned}`,    color: 'text-purple-600', bg: 'bg-purple-50', icon: '💰' },
        { label: 'Pending Amount', value: `₹${stats.totalPending}`,   color: 'text-orange-600', bg: 'bg-orange-50', icon: '⏳' },
        { label: 'Overdue Amount', value: `₹${stats.totalOverdue}`,   color: 'text-red-600',    bg: 'bg-red-50',    icon: '🚨' },
    ];

    return (
        <div className="flex">
            <Sidebar />

            {/* Main Content */}
            <div className="flex-1 min-h-screen p-8 ml-64 bg-gray-100">

                {/* Header */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-800">
                        Dashboard
                    </h2>
                    <p className="mt-1 text-gray-500">
                        Welcome back! Here's your overview.
                    </p>
                </div>

                {/* Stats Cards */}
                {loading ? (
                    <p className="text-gray-500">Loading stats...</p>
                ) : (
                    <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
                        {cards.map((card) => (
                            <div
                                key={card.label}
                                className={`${card.bg} rounded-xl p-6 shadow-sm`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">
                                            {card.label}
                                        </p>
                                        <p className={`text-3xl font-bold ${card.color} mt-2`}>
                                            {card.value}
                                        </p>
                                    </div>
                                    <span className="text-4xl">{card.icon}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Quick Links */}
                <div className="p-6 bg-white shadow-sm rounded-xl">
                    <h3 className="mb-4 text-lg font-bold text-gray-700">
                        Quick Actions
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <a href="/clients" className="flex items-center gap-3 p-4 transition rounded-lg bg-blue-50 hover:bg-blue-100">
                            <span className="text-2xl">👥</span>
                            <span className="font-medium text-blue-700">Manage Clients</span>
                        </a>
                        <a href="/tasks" className="flex items-center gap-3 p-4 transition rounded-lg bg-green-50 hover:bg-green-100">
                            <span className="text-2xl">✅</span>
                            <span className="font-medium text-green-700">Manage Tasks</span>
                        </a>
                        <a href="/payments" className="flex items-center gap-3 p-4 transition rounded-lg bg-purple-50 hover:bg-purple-100">
                            <span className="text-2xl">💰</span>
                            <span className="font-medium text-purple-700">Manage Payments</span>
                        </a>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default Dashboard;