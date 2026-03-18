import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import axios from '../api/axios';
import toast from 'react-hot-toast';

function Payments() {
    const [payments, setPayments] = useState([]);
    const [clients, setClients] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [filter, setFilter] = useState('All');
    const [summary, setSummary] = useState({
        totalEarned: 0, totalPending: 0, totalOverdue: 0
    });
    const [form, setForm] = useState({
        amount: '', client: '', task: '',
        status: 'Pending', description: '', date: ''
    });

    const fetchData = async () => {
        try {
            const [paymentsRes, clientsRes, tasksRes, summaryRes] = await Promise.all([
                axios.get('/payments'),
                axios.get('/clients'),
                axios.get('/tasks'),
                axios.get('/payments/summary'),
            ]);
            setPayments(paymentsRes.data);
            setClients(clientsRes.data);
            setTasks(tasksRes.data);
            setSummary(summaryRes.data);
        } catch (error) {
            toast.error('Failed to load payments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/payments', form);
            toast.success('Payment recorded! 💰');
            setForm({ amount: '', client: '', task: '', status: 'Pending', description: '', date: '' });
            setShowForm(false);
            fetchData();
        } catch (error) {
            toast.error('Something went wrong!');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this payment?')) return;
        try {
            await axios.delete(`/payments/${id}`);
            toast.success('Payment deleted!');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete!');
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await axios.patch(`/payments/${id}/status`, { status: newStatus });
            toast.success('Payment status updated!');
            fetchData();
        } catch (error) {
            toast.error('Failed to update!');
        }
    };

    const filteredPayments = filter === 'All'
        ? payments
        : payments.filter(p => p.status === filter);

    const statusColor = (s) => ({
        'Paid':    'bg-green-100 text-green-600',
        'Pending': 'bg-yellow-100 text-yellow-600',
        'Overdue': 'bg-red-100 text-red-600',
    }[s] || 'bg-gray-100 text-gray-600');

    return (
        <div className="flex">
            <Sidebar />
            <div className="flex-1 min-h-screen p-8 ml-64 bg-gray-100">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">Payments</h2>
                        <p className="mt-1 text-gray-500">Track all your payments</p>
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="px-6 py-3 font-medium text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                        + Add Payment
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-3">
                    <div className="p-5 shadow-sm bg-green-50 rounded-xl">
                        <p className="text-sm text-gray-500">Total Earned</p>
                        <p className="mt-1 text-3xl font-bold text-green-600">₹{summary.totalEarned}</p>
                    </div>
                    <div className="p-5 shadow-sm bg-yellow-50 rounded-xl">
                        <p className="text-sm text-gray-500">Pending Amount</p>
                        <p className="mt-1 text-3xl font-bold text-yellow-600">₹{summary.totalPending}</p>
                    </div>
                    <div className="p-5 shadow-sm bg-red-50 rounded-xl">
                        <p className="text-sm text-gray-500">Overdue Amount</p>
                        <p className="mt-1 text-3xl font-bold text-red-600">₹{summary.totalOverdue}</p>
                    </div>
                </div>

                {/* Filter Buttons */}
                <div className="flex gap-3 mb-6">
                    {['All', 'Pending', 'Paid', 'Overdue'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                filter === f
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                    <span className="self-center ml-auto text-sm text-gray-500">
                        {filteredPayments.length} payment(s)
                    </span>
                </div>

                {/* Add Payment Form */}
                {showForm && (
                    <div className="p-6 mb-6 bg-white shadow-sm rounded-xl">
                        <h3 className="mb-4 text-lg font-bold text-gray-700">
                            Record New Payment
                        </h3>
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-600">Amount (₹) *</label>
                                    <input
                                        name="amount"
                                        type="number"
                                        value={form.amount}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter amount"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-600">Client *</label>
                                    <select
                                        name="client"
                                        value={form.client}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="">Select client</option>
                                        {clients.map(c => (
                                            <option key={c._id} value={c._id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-600">Related Task</label>
                                    <select
                                        name="task"
                                        value={form.task}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="">Select task (optional)</option>
                                        {tasks.map(t => (
                                            <option key={t._id} value={t._id}>{t.title}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-600">Status</label>
                                    <select
                                        name="status"
                                        value={form.status}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Paid">Paid</option>
                                        <option value="Overdue">Overdue</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-600">Description</label>
                                    <input
                                        name="description"
                                        value={form.description}
                                        onChange={handleChange}
                                        placeholder="Payment description"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-600">Date</label>
                                    <input
                                        name="date"
                                        type="date"
                                        value={form.date}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 mt-4">
                                <button type="submit" className="px-6 py-2 text-white transition bg-blue-600 rounded-lg hover:bg-blue-700">
                                    Record Payment
                                </button>
                                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 text-gray-700 transition bg-gray-200 rounded-lg hover:bg-gray-300">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Payments List */}
                {loading ? (
                    <p className="text-gray-500">Loading payments...</p>
                ) : filteredPayments.length === 0 ? (
                    <div className="p-12 text-center bg-white shadow-sm rounded-xl">
                        <p className="text-lg text-gray-400">No payments found</p>
                        <p className="mt-1 text-sm text-gray-400">Click "Add Payment" to get started!</p>
                    </div>
                ) : (
                    <div className="overflow-hidden bg-white shadow-sm rounded-xl">
                        <table className="w-full">
                            <thead className="border-b border-gray-200 bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-sm font-medium text-left text-gray-500">Client</th>
                                    <th className="px-6 py-4 text-sm font-medium text-left text-gray-500">Description</th>
                                    <th className="px-6 py-4 text-sm font-medium text-left text-gray-500">Amount</th>
                                    <th className="px-6 py-4 text-sm font-medium text-left text-gray-500">Status</th>
                                    <th className="px-6 py-4 text-sm font-medium text-left text-gray-500">Date</th>
                                    <th className="px-6 py-4 text-sm font-medium text-left text-gray-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPayments.map((payment, index) => (
                                    <tr key={payment._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        <td className="px-6 py-4 font-medium text-gray-800">
                                            {payment.client?.name || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {payment.description || '—'}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-800">
                                            ₹{payment.amount}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColor(payment.status)}`}>
                                                {payment.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(payment.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <select
                                                    value={payment.status}
                                                    onChange={(e) => handleStatusChange(payment._id, e.target.value)}
                                                    className="px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none"
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="Paid">Paid</option>
                                                    <option value="Overdue">Overdue</option>
                                                </select>
                                                <button
                                                    onClick={() => handleDelete(payment._id)}
                                                    className="px-2 py-1 text-xs text-red-600 transition rounded bg-red-50 hover:bg-red-100"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Payments;