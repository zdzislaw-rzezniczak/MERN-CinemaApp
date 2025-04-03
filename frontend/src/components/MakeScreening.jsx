import { useState, useEffect } from "react";

// eslint-disable-next-line react/prop-types
const CreateScreening = ({ fetchInfo }) => {
    const [formData, setFormData] = useState({
        movie_id: '',
        date: '',
        time: '',
        room_id: '',
    });

    const [movies, setMovies] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [message, setMessage] = useState('');
    const urlMovies  = `${import.meta.env.VITE_BACKEND_URL}movies`;
    const urlRooms  = `${import.meta.env.VITE_BACKEND_URL}rooms`;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const movies = await fetchInfo(urlMovies);
                setMovies(movies.result || []);
                console.log(movies.result)
            } catch (error) {
                console.error("Error fetching movies:", error);
            }

            try {
                const rooms = await fetchInfo(urlRooms);
                setRooms(rooms || []);
                console.log("Rooms API response:", rooms);
            } catch (error) {
                console.error("Error fetching rooms:", error);
            }
        };

        fetchData();
    }, [fetchInfo]);

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

        if(!token.isAdmin) {
            setMessage("You are not admin");
            return;
        }

        const { movie_id, date, time, room_id } = formData;

        if (!movie_id || !date || !time || !room_id) {
            setMessage('All fields are required.');
            return;
        }

        setMessage('');

        const screeningData = {
            movie_id,
            date,
            time,
            room_id
        };

        console.log("Sending screening data:", screeningData); // Debug log

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}screenings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(screeningData),
            });

            if (response.ok) {
                setMessage('Screening created successfully!');
                setFormData({ movie_id: '', date: '', time: '', room_id: '' });
            } else {
                const errorData = await response.json();
                console.error("Backend error:", errorData); // Debug log
                setMessage(errorData?.message || 'Creation of the screening failed.');
            }
        } catch (error) {
            console.error("Network error:", error);
            setMessage('An error occurred while creating the screening.');
        }
    };

    return (
        <div>
            <h2>Create a Screening</h2>
            {message && <p style={{ color: 'red' }}>{message}</p>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="movieId">Movie:</label>
                    <select
                        id="movie_id"
                        name="movie_id"
                        value={formData.movie_id}
                        onChange={handleChange}
                        className="form-control"
                    >
                        <option value="">Select a movie</option>
                        {movies.map((movie) => (
                            <option key={movie._id} value={movie._id}>
                                {movie.title}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="date">Date:</label>
                    <input
                        type="date"
                        id="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        className="form-control"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="time">Time:</label>
                    <input
                        type="time"
                        id="time"
                        name="time"
                        value={formData.time}
                        onChange={handleChange}
                        className="form-control"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="roomId">Room:</label>
                    <select
                        id="room_id"
                        name="room_id"
                        value={formData.room_id}
                        onChange={handleChange}
                        className="form-control"
                    >
                        <option value="">Select a room</option>
                        {rooms.length === 0 ? (
                            <option disabled>Loading rooms...</option>
                        ) : (
                            rooms.map((room) => (
                                <option key={room._id} value={room._id}>
                                    {room.roomNumber}
                                </option>
                            ))
                        )}
                    </select>
                </div>
                <button type="submit" className="btn btn-primary">Create Screening</button>
            </form>
        </div>
    );
};

export default CreateScreening;
