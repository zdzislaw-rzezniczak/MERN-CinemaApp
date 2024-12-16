import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = ({ onLogout }) => {
    return (
        <div style={{ padding: '1rem' }}>
            <h2>Dashboard</h2>
            <p>Welcome to your dashboard!</p>
            <button onClick={onLogout} style={{ padding: '0.5rem 1rem', marginTop: '1rem' }}>
                Logout
            </button>
            <p><Link to="/">Go back to Login</Link></p>
        </div>
    );
};

export default Dashboard;
