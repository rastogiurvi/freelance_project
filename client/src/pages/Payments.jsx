import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

function Payments() {
    const [payments, setPayments] = useState([]);
    const [clients, setClients] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');
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
            toast.success('Status updated!');
            fetchData();
        } catch (error) {
            toast.error('Failed to update!');
        }
    };

    // Export to Excel
    const handleExport = () => {
        if (payments.length === 0) {
            toast.error('No payments to export!');
            return;
        }
        const data = payments.map(p => ({
            Client: p.client?.name || 'N/A',
            Description: p.description || 'Service Payment',
            Amount: `₹${p.amount}`,
            Status: p.status,
            Date: new Date(p.date).toLocaleDateString(),
        }));
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Payments');
        const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        saveAs(new Blob([buf]), 'Payments_Export.xlsx');
        toast.success('Exported to Excel! 📊');
    };

    // Filter + Search
    const filtered = payments
        .filter(p => filter === 'All' || p.status === filter)
        .filter(p =>
            (p.client?.name && p.client.name.toLowerCase().includes(search.toLowerCase())) ||
            (p.description && p.description.toLowerCase().includes(search.toLowerCase()))
        );

    const filterCounts = {
        'All': payments.length,
        'Pending': payments.filter(p => p.status === 'Pending').length,
        'Paid': payments.filter(p => p.status === 'Paid').length,
        'Overdue': payments.filter(p => p.status === 'Overdue').length,
    };

    const statusConfig = {
        'Paid':    { color: 'text-green-600',  bg: 'bg-green-50',  dot: 'bg-green-500',  border: 'border-green-200' },
        'Pending': { color: 'text-yellow-600', bg: 'bg-yellow-50', dot: 'bg-yellow-500', border: 'border-yellow-200' },
        'Overdue': { color: 'text-red-600',    bg: 'bg-red-50',    dot: 'bg-red-500',    border: 'border-red-200' },
    };

    const inputClass = "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm";

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 p-8 ml-64">

                {/* ── HEADER ─────────────────────── */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="mb-1 text-3xl font-bold text-gray-900">Payments</h1>
                        <p className="text-sm text-gray-400">
                            {payments.length} payment{payments.length !== 1 ? 's' : ''} recorded
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition shadow-sm"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Export Excel
                        </button>
                        <button
                            onClick={() => setShowForm(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition shadow-sm"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Payment
                        </button>
                    </div>
                </div>

                {/* ── SUMMARY CARDS ────────────────── */}
                <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-3">
                    {[
                        {
                            label: 'Total Earned',
                            value: `₹${summary.totalEarned}`,
                            icon: '💰',
                            bg: 'bg-gradient-to-br from-green-500 to-green-600',
                            sub: 'Payments received'
                        },
                        {
                            label: 'Pending Amount',
                            value: `₹${summary.totalPending}`,
                            icon: '⏳',
                            bg: 'bg-gradient-to-br from-yellow-400 to-orange-500',
                            sub: 'Awaiting payment'
                        },
                        {
                            label: 'Overdue Amount',
                            value: `₹${summary.totalOverdue}`,
                            icon: '🚨',
                            bg: summary.totalOverdue > 0
                                ? 'bg-gradient-to-br from-red-500 to-red-600'
                                : 'bg-gradient-to-br from-gray-400 to-gray-500',
                            sub: summary.totalOverdue > 0 ? 'Needs attention!' : 'All clear!'
                        },
                    ].map((card) => (
                        <div key={card.label} className={`${card.bg} rounded-2xl p-5 shadow-sm`}>
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center justify-center w-10 h-10 text-xl bg-white bg-opacity-20 rounded-xl">
                                    {card.icon}
                                </div>
                                <span className="text-xs text-white font-medium bg-white bg-opacity-20 px-2.5 py-1 rounded-full">
                                    {card.label}
                                </span>
                            </div>
                            <p className="text-3xl font-black text-white">{card.value}</p>
                            <p className="mt-1 text-xs text-white text-opacity-75">{card.sub}</p>
                        </div>
                    ))}
                </div>

                {/* ── SEARCH + FILTERS ─────────────── */}
                <div className="flex flex-col gap-3 mb-6 md:flex-row">
                    <div className="relative flex-1">
                        <div className="absolute text-gray-400 -translate-y-1/2 left-4 top-1/2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by client name or description..."
                            className="w-full pl-12 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-sm text-sm"
                        />
                        {search && (
                            <button onClick={() => setSearch('')} className="absolute text-gray-400 -translate-y-1/2 right-4 top-1/2 hover:text-gray-600">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                    <div className="flex gap-1.5 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
                        {Object.entries(filterCounts).map(([key, count]) => (
                            <button
                                key={key}
                                onClick={() => setFilter(key)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                                    filter === key
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                {key}
                                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                    filter === key ? 'bg-white bg-opacity-20 text-white' : 'bg-gray-100 text-gray-500'
                                }`}>
                                    {count}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── ADD PAYMENT FORM ─────────────── */}
                {showForm && (
                    <div className="p-6 mb-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-base font-bold text-gray-800">Record New Payment</h3>
                            <button
                                onClick={() => setShowForm(false)}
                                className="flex items-center justify-center w-8 h-8 text-gray-400 transition bg-gray-100 rounded-lg hover:bg-gray-200"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 gap-4 mb-5 md:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-600 mb-1.5">Amount (₹) *</label>
                                    <input name="amount" type="number" value={form.amount} onChange={handleChange} required placeholder="Enter amount" className={inputClass} />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-600 mb-1.5">Client *</label>
                                    <select name="client" value={form.client} onChange={handleChange} required className={inputClass}>
                                        <option value="">Select client</option>
                                        {clients.map(c => (
                                            <option key={c._id} value={c._id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-600 mb-1.5">Related Task</label>
                                    <select name="task" value={form.task} onChange={handleChange} className={inputClass}>
                                        <option value="">Select task (optional)</option>
                                        {tasks.map(t => (
                                            <option key={t._id} value={t._id}>{t.title}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-600 mb-1.5">Status</label>
                                    <select name="status" value={form.status} onChange={handleChange} className={inputClass}>
                                        <option value="Pending">Pending</option>
                                        <option value="Paid">Paid</option>
                                        <option value="Overdue">Overdue</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-600 mb-1.5">Description</label>
                                    <input name="description" value={form.description} onChange={handleChange} placeholder="Payment description" className={inputClass} />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-600 mb-1.5">Date</label>
                                    <input name="date" type="date" value={form.date} onChange={handleChange} className={inputClass} />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4 border-t border-gray-100">
                                <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
                                    Record Payment
                                </button>
                                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 transition">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* ── PAYMENTS TABLE ────────────────── */}
                {loading ? (
                    <div className="flex items-center justify-center h-48">
                        <div className="text-center">
                            <div className="mb-2 text-3xl animate-bounce">⏳</div>
                            <p className="text-sm text-gray-400">Loading payments...</p>
                        </div>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="p-16 text-center bg-white border border-gray-100 shadow-sm rounded-2xl">
                        <div className="mb-4 text-5xl">{search ? '🔍' : '💰'}</div>
                        <h3 className="mb-1 text-lg font-bold text-gray-700">
                            {search ? 'No results found' : filter !== 'All' ? `No ${filter} payments` : 'No payments yet'}
                        </h3>
                        <p className="mb-5 text-sm text-gray-400">
                            {search ? `No payments match "${search}"` : 'Record your first payment to get started!'}
                        </p>
                        {!search && filter === 'All' && (
                            <button onClick={() => setShowForm(true)} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
                                + Add First Payment
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl">
                        {search && (
                            <div className="px-6 py-3 border-b border-gray-100">
                                <p className="text-sm text-gray-400">
                                    {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "{search}"
                                </p>
                            </div>
                        )}
                        {/* Table Header */}
                        <div className="grid grid-cols-6 px-6 py-3 text-xs font-semibold tracking-wider text-gray-500 uppercase border-b border-gray-100 bg-gray-50">
                            <div className="col-span-2">Client & Description</div>
                            <div>Amount</div>
                            <div>Status</div>
                            <div>Date</div>
                            <div>Actions</div>
                        </div>

                        {/* Table Rows */}
                        <div className="divide-y divide-gray-50">
                            {filtered.map((payment) => {
                                const s = statusConfig[payment.status] || statusConfig['Pending'];
                                return (
                                    <div key={payment._id} className={`grid grid-cols-6 px-6 py-4 hover:bg-gray-50 transition items-center ${
                                        payment.status === 'Overdue' ? 'bg-red-50 bg-opacity-30' : ''
                                    }`}>
                                        {/* Client + Description */}
                                        <div className="flex items-center col-span-2 gap-3">
                                            <div className="flex items-center justify-center flex-shrink-0 text-sm font-bold text-white w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                                                {payment.client?.name?.charAt(0).toUpperCase() || '?'}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 truncate">
                                                    {payment.client?.name || 'N/A'}
                                                </p>
                                                <p className="text-xs text-gray-400 truncate">
                                                    {payment.description || 'Service Payment'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Amount */}
                                        <div>
                                            <p className="font-black text-gray-900">₹{payment.amount}</p>
                                        </div>

                                        {/* Status Badge */}
                                        <div>
                                            <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold ${s.bg} ${s.color}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                                                {payment.status}
                                            </span>
                                        </div>

                                        {/* Date */}
                                        <div>
                                            <p className="text-sm text-gray-500">
                                                {new Date(payment.date).toLocaleDateString('en-IN', {
                                                    day: 'numeric', month: 'short', year: 'numeric'
                                                })}
                                            </p>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2">
                                            <select
                                                value={payment.status}
                                                onChange={(e) => handleStatusChange(payment._id, e.target.value)}
                                                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-600"
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="Paid">Paid</option>
                                                <option value="Overdue">Overdue</option>
                                            </select>
                                            <button
                                                onClick={() => handleDelete(payment._id)}
                                                className="flex items-center justify-center w-8 h-8 text-gray-400 transition rounded-lg bg-gray-50 hover:bg-red-50 hover:text-red-500"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Table Footer */}
                        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 bg-gray-50">
                            <p className="text-xs text-gray-400">
                                Showing {filtered.length} of {payments.length} payments
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                                    Paid: {filterCounts['Paid']}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                                    Pending: {filterCounts['Pending']}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                                    Overdue: {filterCounts['Overdue']}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Payments;
