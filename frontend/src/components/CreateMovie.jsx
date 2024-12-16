import React, { useState } from "react";

const CreateMovie = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        poster_url: '',
        duration: '',
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
        const token = sessionStorage.getItem('authToken');

        if (!token) {
            setMessage('No token found. Please log in.');
            return;
        }

        const { title, description, poster_url, duration } = formData;

        if (!title || !description || !poster_url || !duration) {
            setMessage('All fields are required.');
            return;
        }

        setMessage('');

        const movieData = {
            title,
            description,
            poster_url,
            duration: Number(duration),
        };

        try {
            const response = await fetch('http://localhost:5000/api/movies', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(movieData),
            });

            if (response.ok) {
                setMessage('Movie created successfully!');
                setFormData({ title: '', description: '', poster_url: '', duration: '' });
            } else {
                const errorData = await response.json();
                setMessage(errorData?.message || 'Creation of the movie failed.');
            }
        } catch (error) {
            console.error(error);
            setMessage('An error occurred while creating the movie.');
        }
    };

    return (
        <div>
            <h2>Create a Movie</h2>
            {message && <p style={{ color: 'red' }}>{message}</p>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="title">Title:</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="form-control"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="description">Description:</label>
                    <input
                        type="text"
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="form-control"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="poster_url">Poster URL:</label>
                    <input
                        type="text"
                        id="poster_url"
                        name="poster_url"
                        value={formData.poster_url}
                        onChange={handleChange}
                        className="form-control"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="duration">Duration (in minutes):</label>
                    <input
                        type="number"
                        id="duration"
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                        className="form-control"
                    />
                </div>
                <button type="submit" className="btn btn-primary">Create Movie</button>
            </form>
        </div>
    );
};

export default CreateMovie;
