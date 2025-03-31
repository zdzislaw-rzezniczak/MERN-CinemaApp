import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { jwtDecode } from "jwt-decode";

const Reservation = ({ fetchInfo }) => {
    const { screeningId } = useParams();
    const [data, setData] = useState([]);
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [seatDetails, setSeatDetails] = useState({});

    // Improved getUserId function
    const getUserId = () => {
        const token = sessionStorage.getItem('authToken');
        if (!token) {
            console.error('No token found');
            return null;
        }
        try {
            const decoded = jwtDecode(token);
            console.log('Decoded token:', decoded); // Debug log
            // Check different possible ID fields
            return decoded.id || decoded._id || decoded.userId || null;
        } catch (err) {
            console.error('Failed to decode token:', err);
            return null;
        }
    };

    useEffect(() => {
        const fetchUserData = async () => {
            const userId = getUserId();
            console.log('User ID from token:', userId); // Debug log

            if (!userId) {
                setError('User not authenticated or invalid token');
                setLoading(false);
                return;
            }

            try {
                const urlUser = `${import.meta.env.VITE_BACKEND_URL}auth/user/${userId}`;
                const userData = await fetchInfo(urlUser);
                console.log('User data from API:', userData); // Debug log

                if (!userData?.result) {
                    throw new Error('Invalid user data received from server');
                }

                // Ensure the user object has an id
                const completeUser = {
                    ...userData.result,
                    id: userData.result.id || userId
                };
                setUser(completeUser);
            } catch (error) {
                console.error("Error fetching user data:", error);
                setError(error.message);
                setLoading(false);
            }
        };

        fetchUserData();
    }, [screeningId]);

    useEffect(() => {
        if (!user || !user.id) {
            // Don't proceed if we don't have a valid user with ID
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                let reservationsRes;
                let url;

                if (user.isAdmin) {
                    if (!screeningId) {
                        throw new Error('Screening ID is required for admin');
                    }
                    url = `${import.meta.env.VITE_BACKEND_URL}reservations/screening/${screeningId}`;
                } else {

                    url = `${import.meta.env.VITE_BACKEND_URL}reservations/user/${user.id}`;
                }

                console.log('Fetching reservations from:', url); // Debug log
                reservationsRes = await fetchInfo(url);
                console.log('Reservations response:', reservationsRes); // Debug log

                if (!reservationsRes?.reservations) {
                    console.warn("No reservations array in response");
                    setData([]);
                    return;
                }

                setData(reservationsRes.reservations);

                // Fetch seat details
                const allSeats = reservationsRes.reservations.flatMap(r => r.seats);
                const uniqueSeats = [...new Set(allSeats)];
                const seatData = {};

                await Promise.all(
                    uniqueSeats.map(async (seatId) => {
                        try {
                            const response = await fetchInfo(
                                `${import.meta.env.VITE_BACKEND_URL}screenings/seat/${screeningId}/${seatId}`
                            );
                            seatData[seatId] = response.seat_number;
                        } catch (err) {
                            console.error(`Error fetching seat ${seatId}:`, err);
                        }
                    })
                );

                setSeatDetails(seatData);
            } catch (err) {
                console.error("Error fetching reservations:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, screeningId]);

    if (loading) return <p>Loading reservation details...</p>;
    if (error) return <p>Error: {error}</p>;

    const cancelReservation = async (reservationId) => {
        try {
            setLoading(true);

            // Call your backend API to cancel the reservation
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}reservations/cancel/${reservationId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
                },
                body: JSON.stringify({ isCancelled: true })
            });

            if (!response.ok) {
                throw new Error('Failed to cancel reservation');
            }

            // Update the local state to reflect the cancellation
            setData(prevData =>
                prevData.map(reservation =>
                    reservation._id === reservationId
                        ? { ...reservation, isCancelled: true }
                        : reservation
                )
            );

        } catch (err) {
            console.error("Error cancelling reservation:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div>
            <h1>Reservations</h1>
            {data.length > 0 ? (
                <ul>
                    {data.map((reservation) => (
                        <li key={reservation._id}>
                            <p>User: {reservation.user_id?.username || 'Unknown'}</p>
                            <p>Title: {reservation.screening_id?.movie_id?.title || 'Unknown'}</p>
                            <p>Reservation: {reservation.reservation_string}</p>

                            <p>Seats Reserved: {reservation.seats?.length || 0}</p>
                            <ul>
                                {reservation.seats?.map(seatId => (
                                    <li key={seatId}>
                                        Seat Number: {seatDetails[seatId] || 'Unknown'}
                                    </li>
                                ))}
                            </ul>
                            {!reservation.isCancelled && (
                                <button
                                    onClick={() => cancelReservation(reservation._id)}
                                    disabled={loading}
                                >
                                    Cancel Reservation
                                </button>
                            )}
                            {reservation.isCancelled && <p>Reservation Cancelled</p>}
                        </li>
                    ))}
                </ul>
            ) : (
                !loading && <p>No reservations found.</p>
            )}
        </div>
    );
};

export default Reservation;