import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

// eslint-disable-next-line react/prop-types
const Movies = ({ onLogout, fetchInfo }) => {
    const [data, setData] = useState([]);
    const [token, setToken] = useState('');
    const url = `${import.meta.env.VITE_BACKEND_URL}movies`;


    useEffect( () => {

       fetchInfo(url)
           .then(movies => {
               setData(movies.result);
           });

        const storedToken = sessionStorage.getItem('authToken');
        if (storedToken) {
            try {
                const decoded = jwtDecode(storedToken);
                setToken({
                    token: storedToken,
                    isAdmin: decoded.isAdmin
                });
            } catch (e) {
                console.error("Invalid token:", e);
            }
        }
    }, [url]);


    return (
        <div style={{ padding: '1rem' }}>
            <h2>Movies</h2>
            <p>See all our movies!</p>
            {data.length ? (
                data.map((movie) => (
                    <div className={"movies-description"} key={movie._id} style={{ marginBottom: '1rem' }}>
                        <h3>{movie.title}</h3>
                        <p>{movie.description}</p>
                        <img
                            src={movie.poster_url}
                            alt={movie.title}
                            style={{ width: '150px', height: 'auto' }}
                        />
                        <p>Duration: {movie.duration} minutes</p>
                    </div>
                ))
            ) : (
                <p>No movies available or failed to load.</p>
            )}
            <button onClick={onLogout} style={{ padding: '0.5rem 1rem', marginTop: '1rem' }}>
                Logout
            </button>

            <Link to="/screenings">
                <button style={{ padding: '0.5rem 1rem', marginTop: '1rem' }}>
                    Screenings
                </button>
            </Link>
            {token.isAdmin && (
            <Link to="/movies/add">
                <button style={{ padding: '0.5rem 1rem', marginTop: '1rem' }}>
                    Create a Movie
                </button>
            </Link>)}
        </div>
    );
};

export default Movies;
