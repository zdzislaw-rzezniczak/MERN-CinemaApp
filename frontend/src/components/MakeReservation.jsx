import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import {PDFDownloadLink} from '@react-pdf/renderer';
import { Page, Text, Document, StyleSheet } from '@react-pdf/renderer';


// eslint-disable-next-line react/prop-types
const MyDocument = ({roomNumber, selectedSeats, movieTitle, time, date}) => (
    <Document>
        <Page style={styles.page}>
            <Text style={styles.title}>My First PDF</Text>
            <Text style={styles.title}>Room number: {roomNumber}</Text>
            <Text style={styles.title}>Movie: {movieTitle}</Text>
            <Text style={styles.title}>Date: {date}</Text>
            <Text style={styles.title}>time: {time}</Text>
            <Text style={styles.title}>{selectedSeats}</Text>
            <Text style={styles.body}>This is a sample PDF created using @react-pdf/renderer.</Text>
        </Page>
    </Document>
);

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        padding: 20,
    },
    title: {
        fontSize: 24,
        marginBottom: 10,
    },
    body: {
        fontSize: 12,
    },
});

// eslint-disable-next-line react/prop-types
const MakeReservation = ({ fetchInfo }) => {
    const { roomId} = useParams();
    const { screeningId  } = useParams();
    const url = `http://localhost:5000/api/screenings/room/${roomId}`;
    const [data, setData] = useState(null); // Dane pokoju
    const [dataScreening, setDataScreening] = useState(null); // Dane pokoju
    const [error, setError] = useState(null); // Błędy
    const [loading, setLoading] = useState(true); // Ładowanie
    const [selectedSeats, setSelectedSeats] = useState([]); // ID zaznaczonych miejsc
    const [userId, setUserId] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

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
                setError('Failed to fetch room data.'+ err);
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


    const urlScreening = `${import.meta.env.VITE_BACKEND_URL}screenings/${screeningId}`;
    useEffect(() => {
       setUserId(getUserId())

        fetchInfo(urlScreening).then(screening => {
            console.log(screening);
            setDataScreening(screening.result)
        });

    }, []);


    const getUserId = () => {
        const token = sessionStorage.getItem('authToken'); // Pobierz token
        // console.log(token);
        if (!token) {
            console.error('No token found.');
            return null;
        }

        try {

            const decoded = jwtDecode(token,`${import.meta.env.VITE_BACKEND_URL}`);

            const userId = decoded.id
            return userId;

        } catch (err) {
            console.error('Failed to decode token:', err);
            return null;
        }
    };

    const makeReserv = async () => {
        if (!selectedSeats || selectedSeats.length === 0) {
            setError('Please select at least one seat.');
            return;
        }

        // Ensure seats are formatted correctly for the API
        // const formattedSeats = selectedSeats.map(seat => seat);

        const reservationData = {
            screening_id: screeningId,
            user_id: userId,
            seats: selectedSeats,
        };

        console.log("Reservation Data:", JSON.stringify(reservationData));

        const token = sessionStorage.getItem('authToken');

        if (!token) {
            setError('No token found. Please log in.');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/reservations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(reservationData),
            });

            const result = await response.json();

            if (!response.ok) {
                console.error('Reservation error details:', result);
                setError(result?.error?.message || result?.msg || 'Failed to create reservation');
                return;
            }



            setSuccessMessage('Reservation successful!');
            console.log('API Response:', result);

        } catch (err) {
            setError('Error making reservation');
            console.error('Error in makeReserv:', err);
        }
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

            <button onClick={makeReserv}>Make Reservation</button>
            <h6>{successMessage}</h6>
            <PDFDownloadLink
                document={
                    dataScreening ? (
                        <MyDocument
                            roomNumber={data.roomNumber}
                            movieTitle={dataScreening?.movie_id?.title || 'Unknown'}
                            time={dataScreening?.time || 'Unknown'}
                            date={dataScreening?.date || 'Unknown'}
                            selectedSeats={selectedSeats.join(', ')}
                        />
                    ) : (
                        <Document>
                            <Page>
                                <Text>Loading reservation details...</Text>
                            </Page>
                        </Document>
                    )
                }
                fileName="reservation.pdf"
            >
                {({ loading }) =>
                    loading ? 'Preparing document...' : 'Download your reservation as PDF'
                }
            </PDFDownloadLink>


        </div>
    );
};

export default MakeReservation;
