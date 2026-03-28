import generateInvoice from '../utils/generateInvoice';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

function Clients() {
    const { user } = useAuth();
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editClient, setEditClient] = useState(null);
    const [search, setSearch] = useState('');
    const [form, setForm] = useState({
        name: '', email: '', phone: '', address: ''
    });

    const fetchClients = async () => {
        try {
            const res = await axios.get('/clients');
            setClients(res.data);
        } catch (error) {
            toast.error('Failed to load clients');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchClients(); }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editClient) {
                await axios.put(`/clients/${editClient._id}`, form);
                toast.success('Client updated! ✅');
            } else {
                await axios.post('/clients', form);
                toast.success('Client added! 🎉');
            }
            setForm({ name: '', email: '', phone: '', address: '' });
            setShowForm(false);
            setEditClient(null);
            fetchClients();
        } catch (error) {
            toast.error('Something went wrong!');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this client?')) return;
        try {
            await axios.delete(`/clients/${id}`);
            toast.success('Client deleted!');
            fetchClients();
        } catch (error) {
            toast.error('Failed to delete!');
        }
    };

    const handleEdit = (client) => {
        setEditClient(client);
        setForm({
            name: client.name,
            email: client.email,
            phone: client.phone || '',
            address: client.address || ''
        });
        setShowForm(true);
    };

    const handleAddNew = () => {
        setEditClient(null);
        setForm({ name: '', email: '', phone: '', address: '' });
        setShowForm(true);
    };

    const handleGenerateInvoice = async (client) => {
        try {
            const res = await axios.get(`/payments/client/${client._id}`);
            if (res.data.length === 0) {
                toast.error('No payments found for this client!');
                return;
            }
            generateInvoice(client, res.data, user.name);
            toast.success('Invoice downloaded! 🧾');
        } catch (error) {
            toast.error('Failed to generate invoice!');
        }
    };

    // Export to Excel
    const handleExport = () => {
        if (clients.length === 0) {
            toast.error('No clients to export!');
            return;
        }
        const data = clients.map(c => ({
            Name: c.name,
            Email: c.email,
            Phone: c.phone || 'N/A',
            Address: c.address || 'N/A',
            'Added On': new Date(c.createdAt).toLocaleDateString(),
        }));
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Clients');
        const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        saveAs(new Blob([buf]), 'Clients_Export.xlsx');
        toast.success('Exported to Excel! 📊');
    };

    // Filtered clients by search
    const filtered = clients.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        (c.phone && c.phone.includes(search))
    );

    const inputClass = "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm";

    const avatarColors = [
        'from-blue-400 to-blue-600',
        'from-violet-400 to-violet-600',
        'from-green-400 to-green-600',
        'from-orange-400 to-orange-600',
        'from-pink-400 to-pink-600',
        'from-teal-400 to-teal-600',
    ];

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 p-8 ml-64">

                {/* ── HEADER ─────────────────────────── */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="mb-1 text-3xl font-bold text-gray-900">Clients</h1>
                        <p className="text-sm text-gray-400">
                            {clients.length} client{clients.length !== 1 ? 's' : ''} total
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
                            onClick={handleAddNew}
                            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition shadow-sm"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Client
                        </button>
                    </div>
                </div>

                {/* ── SEARCH BAR ──────────────────────── */}
                <div className="relative mb-6">
                    <div className="absolute text-gray-400 -translate-y-1/2 left-4 top-1/2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search clients by name, email or phone..."
                        className="w-full py-3 pl-12 pr-4 text-gray-900 placeholder-gray-400 transition bg-white border border-gray-200 shadow-sm rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="absolute text-gray-400 -translate-y-1/2 right-4 top-1/2 hover:text-gray-600"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* ── ADD/EDIT FORM ────────────────────── */}
                {showForm && (
                    <div className="p-6 mb-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-base font-bold text-gray-800">
                                {editClient ? 'Edit Client' : 'Add New Client'}
                            </h3>
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
                                    <label className="block text-sm font-semibold text-gray-600 mb-1.5">Name *</label>
                                    <input name="name" value={form.name} onChange={handleChange} required placeholder="Client name" className={inputClass} />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-600 mb-1.5">Email *</label>
                                    <input name="email" value={form.email} onChange={handleChange} required placeholder="client@email.com" className={inputClass} />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-600 mb-1.5">Phone</label>
                                    <input name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" className={inputClass} />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-600 mb-1.5">Address</label>
                                    <input name="address" value={form.address} onChange={handleChange} placeholder="City, Country" className={inputClass} />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4 border-t border-gray-100">
                                <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
                                    {editClient ? 'Update Client' : 'Add Client'}
                                </button>
                                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 transition">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* ── CLIENTS GRID ─────────────────────── */}
                {loading ? (
                    <div className="flex items-center justify-center h-48">
                        <div className="text-center">
                            <div className="mb-2 text-3xl animate-bounce">⏳</div>
                            <p className="text-sm text-gray-400">Loading clients...</p>
                        </div>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="p-16 text-center bg-white border border-gray-100 shadow-sm rounded-2xl">
                        <div className="mb-4 text-5xl">{search ? '🔍' : '👥'}</div>
                        <h3 className="mb-1 text-lg font-bold text-gray-700">
                            {search ? 'No results found' : 'No clients yet'}
                        </h3>
                        <p className="mb-5 text-sm text-gray-400">
                            {search ? `No clients match "${search}"` : 'Add your first client to get started!'}
                        </p>
                        {!search && (
                            <button onClick={handleAddNew} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
                                + Add First Client
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {search && (
                            <p className="mb-4 text-sm text-gray-400">
                                {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "{search}"
                            </p>
                        )}
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                            {filtered.map((client, idx) => (
                                <div
                                    key={client._id}
                                    className="overflow-hidden transition bg-white border border-gray-100 shadow-sm rounded-2xl hover:shadow-md group"
                                >
                                    {/* Card Top Color Bar */}
                                    <div className={`h-1.5 bg-gradient-to-r ${avatarColors[idx % avatarColors.length]}`} />

                                    <div className="p-5">
                                        {/* Avatar + Name */}
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${avatarColors[idx % avatarColors.length]} flex items-center justify-center text-white font-black text-xl flex-shrink-0 shadow-sm`}>
                                                {client.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-bold text-gray-900 truncate">{client.name}</h3>
                                                <p className="text-sm text-gray-400 truncate">{client.email}</p>
                                            </div>
                                        </div>

                                        {/* Details */}
                                        <div className="space-y-1.5 mb-4">
                                            {client.phone && (
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <svg className="flex-shrink-0 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                    </svg>
                                                    {client.phone}
                                                </div>
                                            )}
                                            {client.address && (
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <svg className="flex-shrink-0 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    {client.address}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                Added {new Date(client.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-2 mb-2">
                                            <button
                                                onClick={() => handleEdit(client)}
                                                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gray-50 text-gray-600 rounded-xl text-xs font-semibold hover:bg-gray-100 transition"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(client._id)}
                                                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-semibold hover:bg-red-100 transition"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                                Delete
                                            </button>
                                        </div>

                                        {/* Invoice Button */}
                                        <button
                                            onClick={() => handleGenerateInvoice(client)}
                                            className="flex items-center justify-center w-full gap-2 py-2 text-xs font-semibold text-green-600 transition bg-green-50 rounded-xl hover:bg-green-100"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            Generate Invoice PDF
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default Clients;
