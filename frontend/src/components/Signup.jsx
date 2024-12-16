import React, { useState } from 'react';
import {Link} from "react-router-dom";

const Signup = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
    });

    const [message, setMessage] = useState('');


    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        const { username, email, password } = formData;

        if (!username || !email || !password) {
            setMessage('All fields are required.');
            return;
        }

        setMessage('');

        try {
            const response = await fetch('http://localhost:5000/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }),
            });

            if (response.ok) {
                setMessage('Registration successful!');
                setFormData({ username: '', email: '', password: '' });
            } else {
                const errorData = await response.json();
                setMessage(errorData.message || 'Registration failed.');
            }
        } catch (error) {
            console.log(error);
            setMessage(error.message);

        }
    };

    return (
        <div style={{maxWidth: '400px', margin: 'auto', padding: '1rem'}}>
            <h2>Register</h2>
            {message && <p style={{color: 'red'}}>{message}</p>}
            <form onSubmit={handleSubmit}>
                <div style={{marginBottom: '1rem'}}>
                    <label htmlFor="username">Username:</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        autoComplete="on"
                        style={{width: '100%', padding: '0.5rem', marginTop: '0.5rem'}}
                    />
                </div>
                <div style={{marginBottom: '1rem'}}>
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        autoComplete="on"
                        style={{width: '100%', padding: '0.5rem', marginTop: '0.5rem'}}
                    />
                </div>
                <div style={{marginBottom: '1rem'}}>
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        autoComplete="on"
                        style={{width: '100%', padding: '0.5rem', marginTop: '0.5rem'}}
                    />
                </div>
                <button type="submit" style={{padding: '0.5rem 1rem'}}>
                    Register
                </button>
            </form>
            <hr/>
            <span>Allready have account <Link to="/">Login</Link></span>
        </div>
    );
};

export default Signup;
