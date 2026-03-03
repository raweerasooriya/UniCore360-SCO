import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function OAuthCallback() {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Get query parameters from URL
        const params = new URLSearchParams(location.search);
        const email = params.get('email');
        const name = params.get('name');
        const role = params.get('role');

        if (email && role) {
            // Store user info in localStorage
            localStorage.setItem('token', 'google-oauth-token');
            localStorage.setItem('username', name || email);
            localStorage.setItem('role', role);
            localStorage.setItem('email', email);
            
            // Redirect to role-based dashboard
            switch(role) {
                case 'USER':
                    navigate('/user-dashboard');
                    break;
                case 'TECHNICIAN':
                    navigate('/technician-dashboard');
                    break;
                case 'ADMIN':
                    navigate('/admin-dashboard');
                    break;
                default:
                    navigate('/user-dashboard');
            }
        } else {
            navigate('/login');
        }
    }, [location, navigate]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <h2>Completing login...</h2>
        </div>
    );
}

export default OAuthCallback;