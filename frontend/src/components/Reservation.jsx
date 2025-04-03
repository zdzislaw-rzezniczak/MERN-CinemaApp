import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {useNavigate} from 'react-router-dom'
import { jwtDecode } from "jwt-decode";

// eslint-disable-next-line react/prop-types
const Reservation = ({ fetchInfo }) => {
    const { screeningId } = useParams();
    const [data, setData] = useState([]);
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [seatDetails, setSeatDetails] = useState({});
    const navigate = useNavigate();

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
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                let url;

                if (user.isAdmin) {
                    if (!screeningId) {
                        throw new Error('Screening ID is required for admin');
                    }
                    url = `http://localhost:5000/api/reservations/screening/${screeningId}`;
                } else {
                    url = `${import.meta.env.VITE_BACKEND_URL}reservations/user/${user.id}`;
                }

                const reservationsRes = await fetchInfo(url);

                if (!reservationsRes?.reservations) {
                    console.warn("No reservations array in response");
                    setData([]);
                    return;
                }

                setData(reservationsRes.reservations);


                const activeReservations = reservationsRes.reservations.filter(reservation => !reservation.isCancelled);

                const allSeats = activeReservations.flatMap(r => r.seats);
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
                            seatData[seatId] = 'Error fetching seat';
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

    const handlePayment = (reservationId) => {

        navigate(`/stripe/${reservationId}`);

    };

    return (
        <div>
            <h1>Reservations</h1>
            {data.length > 0 ? (
                <ul style={{ listStyleType: 'none' }}>
                    {data.map((reservation) => (
                        <li key={reservation._id}>
                            <p>User: {reservation.user_id?.username || 'Unknown'}</p>
                            <p>Title: {reservation.screening_id?.movie_id?.title || 'Unknown'}</p>
                            <p>Reservation: {reservation.reservation_string}</p>

                            <p>Seats Reserved: {reservation.seats?.length || 0}</p>

                            {!reservation.isCancelled && (<ul>
                                {reservation.seats?.map(seatId => (
                                    <li key={seatId}>
                                        Seat Number: {seatDetails[seatId] || 'Unknown'}
                                    </li>
                                ))}
                            </ul>)}



                            {!reservation.isCancelled && (
                                <div>
                                <button
                                    onClick={() => cancelReservation(reservation._id)}
                                    disabled={loading}
                                >
                                    Cancel Reservation
                                </button>
                                    {/*<button*/}
                                    {/*    onClick={() => handlePayment(reservation._id)}*/}
                                    {/*    disabled={reservation.isPaid}*/}
                                    {/*>*/}
                                    {/*    {reservation.isPaid ? "Already Paid" : "Pay Now"}*/}
                                    {/*</button>                                */}

                                </div>
                            )}
                            {reservation.isCancelled && <p>Reservation Cancelled</p>}
                            <hr  style={{
                                color: '#000000',
                                backgroundColor: '#000000',
                                height: .5,
                                borderColor : '#000000'
                            }}/>
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