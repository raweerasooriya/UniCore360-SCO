import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import UserDashboard from './pages/UserDashboard';
import TechnicianDashboard from './pages/TechnicianDashboard';
import AdminDashboard from './pages/AdminDashboard';
import api from './services/api';
import './App.css';
import { jwtDecode } from 'jwt-decode';   // <-- install: npm install jwt-decode

// Component to handle OAuth2 redirect with JWT token
const OAuth2RedirectHandler = () => {
    const location = useLocation();
    const [processed, setProcessed] = useState(false);

    useEffect(() => {
        if (processed) return;

        const params = new URLSearchParams(location.search);
        const token = params.get('token');

        if (token) {
            try {
                // Decode the JWT token to get role and email
                const decoded = jwtDecode(token);   // <-- FIXED: use jwtDecode
                const email = decoded.sub;
                const role = decoded.role;
                const name = decoded.name;               // 👈 extract name
                localStorage.setItem('name', name);


                console.log('OAuth2RedirectHandler: decoded token', { email, role });

                localStorage.setItem('token', token);
                localStorage.setItem('email', email);
                localStorage.setItem('role', role);

                setProcessed(true);
                window.location.replace('/dashboard');
            } catch (error) {
                console.error('Failed to decode token', error);
                window.location.replace('/login');
            }
        } else {
            console.warn('No token found in redirect URL');
            window.location.replace('/login');
        }
    }, [location, processed]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <h2>Completing login...</h2>
        </div>
    );
};

// Protected Route component (unchanged, but works with token)
const ProtectedRoute = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const location = useLocation();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        
        console.log('ProtectedRoute check:', { token: !!token, role, path: location.pathname });
        
        if (token && role) {
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
        }
    }, [location]);

    if (isAuthenticated === null) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <h2>Loading...</h2>
        </div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

// Role-based routing (unchanged)
const RoleBasedRoute = ({ children, allowedRoles }) => {
    const role = localStorage.getItem('role');
    
    if (!allowedRoles.includes(role)) {
        return <Navigate to={`/${role?.toLowerCase()}-dashboard`} replace />;
    }
    
    return children;
};

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    
                    {/* OAuth2 Redirect Handler - matches backend redirect URI */}
                    <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
                    
                    {/* Protected Routes */}
                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            <NavigateBasedOnRole />
                        </ProtectedRoute>
                    } />
                    
                    <Route path="/user-dashboard" element={
                        <ProtectedRoute>
                            <RoleBasedRoute allowedRoles={['USER']}>
                                <UserDashboard />
                            </RoleBasedRoute>
                        </ProtectedRoute>
                    } />
                    
                    <Route path="/technician-dashboard" element={
                        <ProtectedRoute>
                            <RoleBasedRoute allowedRoles={['TECHNICIAN']}>
                                <TechnicianDashboard />
                            </RoleBasedRoute>
                        </ProtectedRoute>
                    } />
                    
                    <Route path="/admin-dashboard" element={
                        <ProtectedRoute>
                            <RoleBasedRoute allowedRoles={['ADMIN']}>
                                <AdminDashboard />
                            </RoleBasedRoute>
                        </ProtectedRoute>
                    } />
                </Routes>
            </div>
        </Router>
    );
}

// Helper component to redirect based on role
const NavigateBasedOnRole = () => {
    const role = localStorage.getItem('role');
    
    switch(role) {
        case 'USER':
            return <Navigate to="/user-dashboard" replace />;
        case 'TECHNICIAN':
            return <Navigate to="/technician-dashboard" replace />;
        case 'ADMIN':
            return <Navigate to="/admin-dashboard" replace />;
        default:
            return <Navigate to="/login" replace />;
    }
};

export default App;