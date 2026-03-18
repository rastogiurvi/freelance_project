import generateInvoice from '../utils/generateInvoice';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import axios from '../api/axios';
import toast from 'react-hot-toast';

function Clients() {
    const { user } = useAuth();
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editClient, setEditClient] = useState(null);
    const [form, setForm] = useState({
        name: '', email: '', phone: '', address: ''
    });

    // Fetch all clients
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

    // Handle form input changes
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // Add or Update client
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

    // Delete client
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

    // Open edit form
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

    // Open add form
    const handleAddNew = () => {
        setEditClient(null);
        setForm({ name: '', email: '', phone: '', address: '' });
        setShowForm(true);
    };

    // Generate Invoice
    const handleGenerateInvoice = async (client) => {
        try {
            const res = await axios.get(`/payments/client/${client._id}`);
            console.log('Payments found:', res.data);
            if (res.data.length === 0) {
                toast.error('No payments found for this client!');
                return;
            }
            generateInvoice(client, res.data, user.name);
            toast.success('Invoice downloaded! 🧾');
        } catch (error) {
            console.log('Invoice error:', error);
            toast.error('Failed to generate invoice!');
        }
    };

    return (
        <div className="flex">
            <Sidebar />
            <div className="flex-1 min-h-screen p-8 ml-64 bg-gray-100">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">Clients</h2>
                        <p className="mt-1 text-gray-500">Manage all your clients</p>
                    </div>
                    <button
                        onClick={handleAddNew}
                        className="px-6 py-3 font-medium text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                        + Add Client
                    </button>
                </div>

                {/* Add/Edit Form */}
                {showForm && (
                    <div className="p-6 mb-8 bg-white shadow-sm rounded-xl">
                        <h3 className="mb-4 text-lg font-bold text-gray-700">
                            {editClient ? 'Edit Client' : 'Add New Client'}
                        </h3>
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-600">Name *</label>
                                    <input
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        required
                                        placeholder="Client name"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-600">Email *</label>
                                    <input
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="Client email"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-600">Phone</label>
                                    <input
                                        name="phone"
                                        value={form.phone}
                                        onChange={handleChange}
                                        placeholder="Phone number"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-600">Address</label>
                                    <input
                                        name="address"
                                        value={form.address}
                                        onChange={handleChange}
                                        placeholder="Client address"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 mt-4">
                                <button
                                    type="submit"
                                    className="px-6 py-2 text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
                                >
                                    {editClient ? 'Update Client' : 'Add Client'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-6 py-2 text-gray-700 transition bg-gray-200 rounded-lg hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Clients List */}
                {loading ? (
                    <p className="text-gray-500">Loading clients...</p>
                ) : clients.length === 0 ? (
                    <div className="p-12 text-center bg-white shadow-sm rounded-xl">
                        <p className="text-lg text-gray-400">No clients yet</p>
                        <p className="mt-1 text-sm text-gray-400">
                            Click "Add Client" to get started!
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {clients.map((client) => (
                            <div key={client._id} className="p-6 bg-white shadow-sm rounded-xl">

                                {/* Avatar */}
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
                                        <span className="text-lg font-bold text-blue-600">
                                            {client.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800">{client.name}</h3>
                                        <p className="text-sm text-gray-500">{client.email}</p>
                                    </div>
                                </div>

                                {/* Details */}
                                {client.phone && (
                                    <p className="mb-1 text-sm text-gray-500">📞 {client.phone}</p>
                                )}
                                {client.address && (
                                    <p className="mb-4 text-sm text-gray-500">📍 {client.address}</p>
                                )}

                                {/* Edit & Delete Buttons */}
                                <div className="flex gap-2 mt-4">
                                    <button
                                        onClick={() => handleEdit(client)}
                                        className="flex-1 py-2 text-sm font-medium text-blue-600 transition rounded-lg bg-blue-50 hover:bg-blue-100"
                                    >
                                        ✏️ Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(client._id)}
                                        className="flex-1 py-2 text-sm font-medium text-red-600 transition rounded-lg bg-red-50 hover:bg-red-100"
                                    >
                                        🗑️ Delete
                                    </button>
                                </div>

                                {/* Invoice Button — outside flex div */}
                                <button
                                    onClick={() => handleGenerateInvoice(client)}
                                    className="w-full py-2 mt-2 text-sm font-medium text-green-600 transition rounded-lg bg-green-50 hover:bg-green-100"
                                >
                                    🧾 Generate Invoice PDF
                                </button>

                            </div>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
}

export default Clients;