import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

function Tasks() {
    const [tasks, setTasks] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editTask, setEditTask] = useState(null);
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');
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

    const handleStatusChange = async (id, newStatus) => {
        try {
            await axios.patch(`/tasks/${id}/status`, { status: newStatus });
            toast.success('Status updated!');
            fetchData();
        } catch (error) {
            toast.error('Failed to update status!');
        }
    };

    // Export to Excel
    const handleExport = () => {
        if (tasks.length === 0) {
            toast.error('No tasks to export!');
            return;
        }
        const data = tasks.map(t => ({
            Title: t.title,
            Description: t.description || 'N/A',
            Client: t.client?.name || 'N/A',
            Status: t.status,
            Priority: t.priority,
            'Due Date': t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'N/A',
        }));
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Tasks');
        const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        saveAs(new Blob([buf]), 'Tasks_Export.xlsx');
        toast.success('Exported to Excel! 📊');
    };

    const isOverdue = (dueDate) => dueDate && new Date(dueDate) < new Date();

    // Filter + Search
    const filtered = tasks
        .filter(t => filter === 'All' || t.status === filter)
        .filter(t =>
            t.title.toLowerCase().includes(search.toLowerCase()) ||
            (t.description && t.description.toLowerCase().includes(search.toLowerCase())) ||
            (t.client?.name && t.client.name.toLowerCase().includes(search.toLowerCase()))
        );

    // Progress
    const completed = tasks.filter(t => t.status === 'Done').length;
    const progress = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;

    const priorityConfig = {
        'High':   { color: 'text-red-600',    bg: 'bg-red-50',    dot: 'bg-red-500' },
        'Medium': { color: 'text-yellow-600',  bg: 'bg-yellow-50', dot: 'bg-yellow-500' },
        'Low':    { color: 'text-green-600',   bg: 'bg-green-50',  dot: 'bg-green-500' },
    };

    const statusConfig = {
        'To-Do':       { color: 'text-gray-600',  bg: 'bg-gray-100',  dot: 'bg-gray-400' },
        'In Progress': { color: 'text-blue-600',  bg: 'bg-blue-50',   dot: 'bg-blue-500' },
        'Done':        { color: 'text-green-600', bg: 'bg-green-50',  dot: 'bg-green-500' },
    };

    const filterCounts = {
        'All': tasks.length,
        'To-Do': tasks.filter(t => t.status === 'To-Do').length,
        'In Progress': tasks.filter(t => t.status === 'In Progress').length,
        'Done': tasks.filter(t => t.status === 'Done').length,
    };

    const inputClass = "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm";

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 p-8 ml-64">

                {/* ── HEADER ─────────────────────── */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="mb-1 text-3xl font-bold text-gray-900">Tasks</h1>
                        <p className="text-sm text-gray-400">
                            {tasks.length} task{tasks.length !== 1 ? 's' : ''} · {completed} completed
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
                            onClick={() => { setEditTask(null); setForm({ title: '', description: '', client: '', dueDate: '', priority: 'Medium', status: 'To-Do' }); setShowForm(true); }}
                            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition shadow-sm"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Task
                        </button>
                    </div>
                </div>

                {/* ── PROGRESS BAR ─────────────────── */}
                <div className="p-5 mb-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <p className="text-sm font-bold text-gray-800">Overall Progress</p>
                            <p className="text-gray-400 text-xs mt-0.5">{completed} of {tasks.length} tasks done</p>
                        </div>
                        <span className={`text-2xl font-black ${
                            progress === 100 ? 'text-green-500' :
                            progress > 50 ? 'text-blue-500' : 'text-orange-500'
                        }`}>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-700 ${
                                progress === 100 ? 'bg-green-500' :
                                progress > 50 ? 'bg-blue-500' : 'bg-orange-400'
                            }`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    {/* Mini stats */}
                    <div className="flex gap-6 mt-3">
                        {Object.entries(filterCounts).filter(([k]) => k !== 'All').map(([key, count]) => (
                            <div key={key} className="flex items-center gap-1.5">
                                <div className={`w-2 h-2 rounded-full ${statusConfig[key]?.dot}`} />
                                <span className="text-xs text-gray-400">{key}: {count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── SEARCH + FILTERS ─────────────── */}
                <div className="flex flex-col gap-3 mb-6 md:flex-row">
                    {/* Search */}
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
                            placeholder="Search tasks by title, description or client..."
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

                    {/* Filter Tabs */}
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

                {/* ── ADD/EDIT FORM ─────────────────── */}
                {showForm && (
                    <div className="p-6 mb-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-base font-bold text-gray-800">
                                {editTask ? 'Edit Task' : 'Add New Task'}
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
                                    <label className="block text-sm font-semibold text-gray-600 mb-1.5">Title *</label>
                                    <input name="title" value={form.title} onChange={handleChange} required placeholder="Task title" className={inputClass} />
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
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-600 mb-1.5">Description</label>
                                    <input name="description" value={form.description} onChange={handleChange} placeholder="Task description (optional)" className={inputClass} />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-600 mb-1.5">Due Date</label>
                                    <input name="dueDate" type="date" value={form.dueDate} onChange={handleChange} className={inputClass} />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-600 mb-1.5">Priority</label>
                                    <select name="priority" value={form.priority} onChange={handleChange} className={inputClass}>
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-600 mb-1.5">Status</label>
                                    <select name="status" value={form.status} onChange={handleChange} className={inputClass}>
                                        <option value="To-Do">To-Do</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Done">Done</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4 border-t border-gray-100">
                                <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
                                    {editTask ? 'Update Task' : 'Add Task'}
                                </button>
                                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 transition">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* ── TASKS LIST ───────────────────── */}
                {loading ? (
                    <div className="flex items-center justify-center h-48">
                        <div className="text-center">
                            <div className="mb-2 text-3xl animate-bounce">⏳</div>
                            <p className="text-sm text-gray-400">Loading tasks...</p>
                        </div>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="p-16 text-center bg-white border border-gray-100 shadow-sm rounded-2xl">
                        <div className="mb-4 text-5xl">{search ? '🔍' : '✅'}</div>
                        <h3 className="mb-1 text-lg font-bold text-gray-700">
                            {search ? 'No results found' : filter !== 'All' ? `No ${filter} tasks` : 'No tasks yet'}
                        </h3>
                        <p className="mb-5 text-sm text-gray-400">
                            {search ? `No tasks match "${search}"` : 'Create your first task to get started!'}
                        </p>
                        {!search && filter === 'All' && (
                            <button
                                onClick={() => setShowForm(true)}
                                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
                            >
                                + Add First Task
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {search && (
                            <p className="text-sm text-gray-400">
                                {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "{search}"
                            </p>
                        )}
                        {filtered.map((task) => {
                            const overdue = isOverdue(task.dueDate) && task.status !== 'Done';
                            const p = priorityConfig[task.priority] || priorityConfig['Medium'];
                            const s = statusConfig[task.status] || statusConfig['To-Do'];

                            return (
                                <div
                                    key={task._id}
                                    className={`bg-white rounded-2xl shadow-sm border hover:shadow-md transition overflow-hidden ${
                                        overdue ? 'border-red-200' : 'border-gray-100'
                                    }`}
                                >
                                    {/* Left accent bar */}
                                    <div className="flex">
                                        <div className={`w-1 flex-shrink-0 ${p.dot}`} />
                                        <div className="flex-1 p-5">
                                            <div className="flex items-start justify-between gap-4">

                                                {/* Left Content */}
                                                <div className="flex-1 min-w-0">
                                                    {/* Title + Badges */}
                                                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                                        <h3 className="font-bold text-gray-900">
                                                            {task.title}
                                                        </h3>
                                                        {overdue && (
                                                            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold animate-pulse">
                                                                OVERDUE
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Description */}
                                                    {task.description && (
                                                        <p className="mb-2 text-sm text-gray-400 truncate">
                                                            {task.description}
                                                        </p>
                                                    )}

                                                    {/* Meta row */}
                                                    <div className="flex flex-wrap items-center gap-3">
                                                        {/* Priority */}
                                                        <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold ${p.bg} ${p.color}`}>
                                                            <div className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
                                                            {task.priority}
                                                        </span>

                                                        {/* Status */}
                                                        <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold ${s.bg} ${s.color}`}>
                                                            <div className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                                                            {task.status}
                                                        </span>

                                                        {/* Client */}
                                                        {task.client && (
                                                            <span className="flex items-center gap-1 text-xs text-gray-400">
                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                                </svg>
                                                                {task.client.name}
                                                            </span>
                                                        )}

                                                        {/* Due Date */}
                                                        {task.dueDate && (
                                                            <span className={`flex items-center gap-1 text-xs ${overdue ? 'text-red-500' : 'text-gray-400'}`}>
                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                </svg>
                                                                {new Date(task.dueDate).toLocaleDateString()}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Right Actions */}
                                                <div className="flex items-center flex-shrink-0 gap-2">
                                                    {/* Quick Status */}
                                                    <select
                                                        value={task.status}
                                                        onChange={(e) => handleStatusChange(task._id, e.target.value)}
                                                        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-600"
                                                    >
                                                        <option value="To-Do">To-Do</option>
                                                        <option value="In Progress">In Progress</option>
                                                        <option value="Done">Done</option>
                                                    </select>

                                                    {/* Edit */}
                                                    <button
                                                        onClick={() => handleEdit(task)}
                                                        className="flex items-center justify-center w-8 h-8 text-gray-500 transition rounded-lg bg-gray-50 hover:bg-blue-50 hover:text-blue-600"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>

                                                    {/* Delete */}
                                                    <button
                                                        onClick={() => handleDelete(task._id)}
                                                        className="flex items-center justify-center w-8 h-8 text-gray-500 transition rounded-lg bg-gray-50 hover:bg-red-50 hover:text-red-600"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Tasks;
