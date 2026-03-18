import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Sidebar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // helper to highlight active page
    const isActive = (path) => location.pathname === path;

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/clients',   label: 'Clients',   icon: '👥' },
        { path: '/tasks',     label: 'Tasks',     icon: '✅' },
        { path: '/payments',  label: 'Payments',  icon: '💰' },
    ];

    return (
        <div className="fixed top-0 left-0 flex flex-col w-64 h-screen text-white bg-gray-900">

            {/* Logo */}
            <div className="p-6 border-b border-gray-700">
                <h1 className="text-xl font-bold text-blue-400">
                    Freelancer Platform
                </h1>
                <p className="mt-1 text-sm text-gray-400">
                    👋 {user?.name}
                </p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition duration-200 ${
                            isActive(item.path)
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-300 hover:bg-gray-700'
                        }`}
                    >
                        <span>{item.icon}</span>
                        <span className="font-medium">{item.label}</span>
                    </Link>
                ))}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-gray-700">
                <button
                    onClick={handleLogout}
                    className="flex items-center w-full gap-3 px-4 py-3 text-gray-300 transition duration-200 rounded-lg hover:bg-red-600 hover:text-white"
                >
                    <span>🚪</span>
                    <span className="font-medium">Logout</span>
                </button>
            </div>

        </div>
    );
}

export default Sidebar;
