import { useEffect, useState } from 'react';
import {Link} from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';


// eslint-disable-next-line react/prop-types
const Screenings = ({ onLogout, fetchInfo }) => {
    const [data, setData] = useState([]); // Ensure the initial state is an empty array
    const [error] = useState(''); // For error handling
    const [token, setToken] = useState('');



    const url = `${import.meta.env.VITE_BACKEND_URL}screenings`;

    useEffect(() => {
        fetchInfo(url).then(screenings => {
            // console.log(screenings);
            setData(screenings.result)
            console.log(screenings);
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
        <div  style={{ padding: '1rem' }}>
            <h2>Screenings</h2>
            <p>See all our screenings</p>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            {Array.isArray(data) && data.length > 0 ? (
                data.map((screening) => (
                    <div className={"screening-description"} key={screening._id} style={{ marginBottom: '1rem', border: '1px solid #ddd', padding: '1rem' }}>
                        <h3>Date: {new Date(screening.date).toLocaleDateString()}</h3>
                        <p>Time: {screening.time}</p>
                        {screening.movie_id && (
                            <>
                                <p>Movie: {screening.movie_id.title}</p>
                                <p>Description: {screening.movie_id.description}</p>
                            </>
                        )}
                        {/*{screening.room_id && <p>Room Number: {screening.roomNumber}</p>}*/}
                        <Link to={`/reservations/room/${screening.room_id}/${screening._id}`} style={{ color: 'blue', textDecoration: 'underline' }}>
                            Make a Reservation
                        </Link>
                    </div>
                ))


            ) : (
                <p>No screenings available or failed to load.</p>
            )}

            {token.isAdmin &&
                (<Link to="/screenings/make">
                <button style={{ padding: '0.5rem 1rem', marginTop: '1rem' }}>
                    Create screening
                </button>
            </Link>)}
            <button onClick={onLogout} style={{ padding: '0.5rem 1rem', marginTop: '1rem' }}>
                Logout
            </button>
            <p><Link to="/">Go back to Login</Link></p>
        </div>
    );
};

export default Screenings;
