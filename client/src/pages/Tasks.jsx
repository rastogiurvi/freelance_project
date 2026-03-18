import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import axios from '../api/axios';
import toast from 'react-hot-toast';

function Tasks() {
    const [tasks, setTasks] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editTask, setEditTask] = useState(null);
    const [filter, setFilter] = useState('All');
    const [form, setForm] = useState({
        title: '', description: '', client: '',
        dueDate: '', priority: 'Medium', status: 'To-Do'
    });

    const fetchData = async () => {
        try {
            const [tasksRes, clientsRes] = await Promise.all([
                axios.get('/tasks'),
                axios.get('/clients'),
            ]);
            setTasks(tasksRes.data);
            setClients(clientsRes.data);
        } catch (error) {
            toast.error('Failed to load tasks');
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
            if (editTask) {
                await axios.put(`/tasks/${editTask._id}`, form);
                toast.success('Task updated! ✅');
            } else {
                await axios.post('/tasks', form);
                toast.success('Task created! 🎉');
            }
            setForm({ title: '', description: '', client: '', dueDate: '', priority: 'Medium', status: 'To-Do' });
            setShowForm(false);
            setEditTask(null);
            fetchData();
        } catch (error) {
            toast.error('Something went wrong!');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this task?')) return;
        try {
            await axios.delete(`/tasks/${id}`);
            toast.success('Task deleted!');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete!');
        }
    };

    const handleEdit = (task) => {
        setEditTask(task);
        setForm({
            title: task.title,
            description: task.description || '',
            client: task.client?._id || '',
            dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
            priority: task.priority,
            status: task.status,
        });
        setShowForm(true);
    };

    // Update status quickly
    const handleStatusChange = async (id, newStatus) => {
        try {
            await axios.patch(`/tasks/${id}/status`, { status: newStatus });
            toast.success('Status updated!');
            fetchData();
        } catch (error) {
            toast.error('Failed to update status!');
        }
    };

    // Filter tasks by status
    const filteredTasks = filter === 'All'
        ? tasks
        : tasks.filter(t => t.status === filter);

    // Color helpers
    const priorityColor = (p) => ({
        'High':   'bg-red-100 text-red-600',
        'Medium': 'bg-yellow-100 text-yellow-600',
        'Low':    'bg-green-100 text-green-600',
    }[p] || 'bg-gray-100 text-gray-600');

    const statusColor = (s) => ({
        'To-Do':       'bg-gray-100 text-gray-600',
        'In Progress': 'bg-blue-100 text-blue-600',
        'Done':        'bg-green-100 text-green-600',
    }[s] || 'bg-gray-100 text-gray-600');

    return (
        <div className="flex">
            <Sidebar />
            <div className="flex-1 min-h-screen p-8 ml-64 bg-gray-100">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">Tasks</h2>
                        <p className="mt-1 text-gray-500">Manage all your tasks</p>
                    </div>
                    <button
                        onClick={() => { setEditTask(null); setForm({ title:'', description:'', client:'', dueDate:'', priority:'Medium', status:'To-Do' }); setShowForm(true); }}
                        className="px-6 py-3 font-medium text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                        + Add Task
                    </button>
                </div>

                {/* Filter Buttons */}
                <div className="flex gap-3 mb-6">
                    {['All', 'To-Do', 'In Progress', 'Done'].map(f => (
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
                        {filteredTasks.length} task(s)
                    </span>
                </div>

                {/* Add/Edit Form */}
                {showForm && (
                    <div className="p-6 mb-6 bg-white shadow-sm rounded-xl">
                        <h3 className="mb-4 text-lg font-bold text-gray-700">
                            {editTask ? 'Edit Task' : 'Add New Task'}
                        </h3>
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-600">Title *</label>
                                    <input
                                        name="title"
                                        value={form.title}
                                        onChange={handleChange}
                                        required
                                        placeholder="Task title"
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
                                    <label className="block mb-1 text-sm font-medium text-gray-600">Description</label>
                                    <input
                                        name="description"
                                        value={form.description}
                                        onChange={handleChange}
                                        placeholder="Task description"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-600">Due Date</label>
                                    <input
                                        name="dueDate"
                                        type="date"
                                        value={form.dueDate}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-600">Priority</label>
                                    <select
                                        name="priority"
                                        value={form.priority}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
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
                                        <option value="To-Do">To-Do</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Done">Done</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-3 mt-4">
                                <button type="submit" className="px-6 py-2 text-white transition bg-blue-600 rounded-lg hover:bg-blue-700">
                                    {editTask ? 'Update Task' : 'Add Task'}
                                </button>
                                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 text-gray-700 transition bg-gray-200 rounded-lg hover:bg-gray-300">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Tasks List */}
                {loading ? (
                    <p className="text-gray-500">Loading tasks...</p>
                ) : filteredTasks.length === 0 ? (
                    <div className="p-12 text-center bg-white shadow-sm rounded-xl">
                        <p className="text-lg text-gray-400">No tasks found</p>
                        <p className="mt-1 text-sm text-gray-400">
                            {filter !== 'All' ? `No tasks with status "${filter}"` : 'Click "Add Task" to get started!'}
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {filteredTasks.map((task) => (
                            <div key={task._id} className="p-6 bg-white shadow-sm rounded-xl">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        {/* Title + Badges */}
                                        <div className="flex flex-wrap items-center gap-3 mb-2">
                                            <h3 className="text-lg font-bold text-gray-800">
                                                {task.title}
                                            </h3>
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${priorityColor(task.priority)}`}>
                                                {task.priority}
                                            </span>
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor(task.status)}`}>
                                                {task.status}
                                            </span>
                                        </div>

                                        {/* Description */}
                                        {task.description && (
                                            <p className="mb-2 text-sm text-gray-500">{task.description}</p>
                                        )}

                                        {/* Meta */}
                                        <div className="flex gap-4 text-sm text-gray-400">
                                            {task.client && <span>👥 {task.client.name}</span>}
                                            {task.dueDate && <span>📅 {new Date(task.dueDate).toLocaleDateString()}</span>}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col gap-2 ml-4">
                                        {/* Quick status change */}
                                        <select
                                            value={task.status}
                                            onChange={(e) => handleStatusChange(task._id, e.target.value)}
                                            className="px-2 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none"
                                        >
                                            <option value="To-Do">To-Do</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Done">Done</option>
                                        </select>
                                        <button
                                            onClick={() => handleEdit(task)}
                                            className="px-3 py-1 text-sm text-blue-600 transition rounded-lg bg-blue-50 hover:bg-blue-100"
                                        >
                                            ✏️ Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(task._id)}
                                            className="px-3 py-1 text-sm text-red-600 transition rounded-lg bg-red-50 hover:bg-red-100"
                                        >
                                            🗑️ Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Tasks;