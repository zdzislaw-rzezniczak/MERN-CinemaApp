import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

// eslint-disable-next-line react/prop-types
const Reservation = ({ fetchInfo }) => {
    const {screeningId} = useParams(); // Extract the screening ID from the URL
    const [data, setData] = useState([]);
    const [, setDataScreening] = useState([]);
    const [error, setError] = useState(null); // State to track errors
    const [loading, setLoading] = useState(true); // State to show a loading spinner

    const url = `${import.meta.env.VITE_BACKEND_URL}reservations/screening/${screeningId}`;
    const urlScreenings = `${import.meta.env.VITE_BACKEND_URL}screenings/${screeningId}`;

    useEffect(() => {
        const fetchReservations = async () => {
            try {
                const response = await fetchInfo(url);


                if (response.reservations && Array.isArray(response.reservations)) {
                    setData(response.reservations); // Handle array data
                } else {
                    console.error('Unexpected reservations data:', response);
                    setData([]); // Handle unexpected cases
                }
            } catch (err) {
                console.error('Failed to fetch reservation data:', err.message);
                setError('Failed to fetch reservation data.');
            } finally {
                setLoading(false);
            }
        };


        fetchReservations();
    }, [url]); // Ensure dependencies are correctly included

    useEffect(() => {
        const fetchScreening = async () => {
            try {
                const screening = await fetchInfo(urlScreenings);
                if (screening) {
                    setDataScreening(screening);
                }
            } catch (err) {
                setError('Failed to fetch screening data.' + err);
            } finally {
                setLoading(false); // Zatrzymanie loadera niezależnie od wyniku
            }
        };

        fetchScreening();
    }, [urlScreenings]);


    useEffect(()=>{
        console.log(data)
    }, [data])


    if (loading) return <p>Loading reservation details...</p>;
    if (error) return <p>{error}</p>;


    return (
        <div>
            {loading ? (
                <p>Loading reservations...</p>
            ) : error ? (
                <p>{error}</p>
            ) : data && data.length > 0 ? (
                <ul>
                    <h1>Reservations</h1>
                    {data.map((reservation) => (
                        <li key={reservation._id}>
                            <p>User: {reservation.user_id.username}</p>
                            <p>Title: {reservation.screening_id.movie_id.title}</p>
                            <p>Rezerwacja: {reservation.reservation_string}</p>
                            <p>Seats Reserved: {reservation.seats.length}</p>
                            <ul >
                                {reservation.seats.map((seat) => (
                                    <li key={seat._id}>Seat number: {seat.seat_id}</li>
                                ))}

                            </ul>
                            {/* Uncomment below if `room_id` has `roomNumber` */}
                            {/* <p>Room: {reservation.room_id.roomNumber}</p> */}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No reservations found.</p>
            )}
        </div>

    );

};

export default Reservation;
