import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const MakeReservationOLD = ({ fetchInfo }) => {
    const { roomId } = useParams();
    const url = `http://localhost:5000/api/screenings/room/${roomId}`;
    const [data, setData] = useState(null); // Dane pokoju
    const [error, setError] = useState(null); // Błędy
    const [loading, setLoading] = useState(true); // Ładowanie
    const [selectedSeats, setSelectedSeats] = useState([]); // ID zaznaczonych miejsc

    useEffect(() => {
        const fetchRoom = async () => {
            try {
                setLoading(true);
                const room = await fetchInfo(url);
                if (room) {
                    setData(room);
                } else {
                    setError('No room data available.');
                }
            } catch (err) {
                setError('Failed to fetch room data.');
            } finally {
                setLoading(false);
            }
        };

        fetchRoom();
    }, [fetchInfo, url]);

    const toggleSeatSelection = (seatId) => {
        setSelectedSeats((prevSelectedSeats) => {
            // console.log(selectedSeats)
            if (prevSelectedSeats.includes(seatId)) {
                return prevSelectedSeats.filter((id) => id !== seatId);
            } else {
                return [...prevSelectedSeats, seatId];
            }

        });
    };

    if (loading) {
        return <p>Loading room data...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    if (!data) {
        return <p>No room data found.</p>;
    }

    return (
        <div>
            <h1>Room Details</h1>
            <p>Room Number: {data.roomNumber}</p>
            <p>Seats Quantity: {data.seatsQuantity}</p>
            <ul>
                {data.seats?.map((seat) => (
                    <div
                        key={seat._id}
                        className={
                            seat.isReserved
                                ? "seat_reserved"
                                : selectedSeats.includes(seat._id)
                                    ? "seat_selected"
                                    : "seat_available"
                        }
                        onClick={() => {
                            if (!seat.isReserved) {
                                toggleSeatSelection(seat._id);
                            }
                        }}
                    >
                        Seat Number: {seat.seatNumber}
                    </div>
                ))}
            </ul>
        </div>
    );
};

export default MakeReservationOLD;
