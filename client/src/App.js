import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Tasks from './pages/Tasks';
import Payments from './pages/Payments';
import Profile from './pages/Profile';

// Protected Route Component
// Only logged in users can access these pages
const PrivateRoute = ({ children }) => {
    const { user } = useAuth();
    return user ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <BrowserRouter>
            {/* Toast notifications appear here */}
            <Toaster position="top-right" />

            <Routes>
                {/* Public routes - anyone can access */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Private routes - only logged in users */}
                <Route path="/dashboard" element={
                    <PrivateRoute>
                        <Dashboard />
                    </PrivateRoute>
                } />

                <Route path="/clients" element={
                    <PrivateRoute>
                        <Clients />
                    </PrivateRoute>
                } />
                <Route path="/tasks" element={
                    <PrivateRoute>
                        <Tasks />
                    </PrivateRoute>
                } />

                <Route path="/payments" element={
                    <PrivateRoute>
                        <Payments />
                    </PrivateRoute>
                } />

                <Route path="/profile" element={
                    <PrivateRoute>
                        <Profile />
                    </PrivateRoute>
                } />

                {/* Default - redirect to login */}
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;