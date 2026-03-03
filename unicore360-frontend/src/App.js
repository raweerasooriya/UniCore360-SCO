import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import UserDashboard from './pages/UserDashboard';
import TechnicianDashboard from './pages/TechnicianDashboard';
import AdminDashboard from './pages/AdminDashboard';
import api from './services/api';
import './App.css';

// Component to handle OAuth redirect and set localStorage
const OAuthHandler = () => {
    const location = useLocation();
    const [processed, setProcessed] = useState(false);

    useEffect(() => {
        // Get parameters from URL
        const params = new URLSearchParams(location.search);
        const email = params.get('email');
        const name = params.get('name');
        const role = params.get('role');
        const picture = params.get('picture');

        if (email && role && !processed) {
            console.log('OAuthHandler: Setting user data from URL', { email, role });
            
            // Store in localStorage
            localStorage.setItem('token', 'google-oauth-token');
            localStorage.setItem('username', name || email);
            localStorage.setItem('role', role);
            localStorage.setItem('email', email);
            if (picture) localStorage.setItem('picture', picture);
            
            setProcessed(true);
            
            // Redirect to dashboard without query parameters
            window.location.replace('/dashboard');
        }
    }, [location, processed]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <h2>Completing login...</h2>
        </div>
    );
};

// Protected Route component
const ProtectedRoute = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const location = useLocation();

    useEffect(() => {
        // Check authentication
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        
        console.log('ProtectedRoute check:', { token, role, path: location.pathname });
        
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

// Role-based routing
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
                    
                    {/* OAuth Handler Route - captures redirect with parameters */}
                    <Route path="/oauth-redirect" element={<OAuthHandler />} />
                    
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