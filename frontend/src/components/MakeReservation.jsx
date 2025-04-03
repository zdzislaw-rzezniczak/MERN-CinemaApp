import { useEffect, useState } from 'react';
import {Link, useNavigate, useParams} from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Page, Text, Document, StyleSheet } from '@react-pdf/renderer';

// Komponent PDF
const MyDocument = ({ roomNumber, selectedSeats, movieTitle, time, date }) => (
    <Document>
        <Page style={styles.page}>
            <Text style={styles.title}>Rezerwacja!</Text>
            <Text>Room number: {roomNumber}</Text>
            <Text>Movie: {movieTitle}</Text>
            <Text>Date: {date}</Text>
            <Text>Time: {time}</Text>
            <Text>Selected seats: {selectedSeats.join(', ')}</Text>
        </Page>
    </Document>
);

const styles = StyleSheet.create({
    page: { flexDirection: 'column', backgroundColor: '#ffffff', padding: 20 },
    title: { fontSize: 24, marginBottom: 10 },
});

const MakeReservation = ({ fetchInfo }) => {
    const { screeningId } = useParams();
    const urlScreening = `http://localhost:5000/api/screenings/${screeningId}`;

    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [selectedSeatNumbers, setSelectedSeatNumbers] = useState([]);
    const [userId, setUserId] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    const [shouldRefresh, setShouldRefresh] = useState(false);



    const fetchScreening = async () => {
        try {
            setLoading(true);
            const screening = await fetchInfo(urlScreening);
            // console.log("Fetched screening data:", screening);

            if (screening?.result) {
                setData(screening.result);
            } else {
                setError("Failed to fetch screening data.");
            }
        } catch (err) {
            setError("Error fetching screening: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchScreening();
        setUserId(getUserId());
    }, [fetchInfo, urlScreening]);

    useEffect(() => {
        if (shouldRefresh) {
            window.location.reload();
        }
    }, [shouldRefresh]);

    const getUserId = () => {
        const token = sessionStorage.getItem('authToken');
        if (!token) {
            console.error('No token found.');
            return null;
        }

        try {
            return jwtDecode(token).id;
        } catch (err) {
            console.error('Failed to decode token:', err);
            return null;
        }
    };

    const toggleSeatSelection = (seatId, seatNumber) => {
        setSelectedSeats((prev) =>
            prev.includes(seatId)
                ? prev.filter((id) => id !== seatId)
                : [...prev, seatId]
        );

        setSelectedSeatNumbers((prev) =>
            prev.includes(seatNumber)
                ? prev.filter((num) => num !== seatNumber)
                : [...prev, seatNumber]
        );
    };

    const makeReserv = async () => {
        if (!selectedSeats || selectedSeats.length === 0) {
            setError("Please select at least one seat.");
            return;
        }

        const reservationData = {
            screening_id: screeningId,
            user_id: userId,
            seats: selectedSeats,
        };

        // console.log("Reservation Data Sent to API:", reservationData);
        //
        const token = sessionStorage.getItem("authToken");
        if (!token) {
            setError("No token found. Please log in.");
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/reservations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(reservationData),
            });

            const result = await response.json();
            if (!response.ok) {
                setError(result?.error?.message || result?.msg || "Failed to create reservation");
                return;
            }

            setSuccessMessage("Reservation successful!");

        } catch (err) {
            setError("Error making reservation");
        }
    };


    if (loading) return <p>Loading room data...</p>;
    if (error) return <p>{error}</p>;
    if (!data || !data.seats) return <p>No seats available.</p>;

    return (
        <div className={"reservation-container"}>
            <h1>Room Details</h1>
            <p>Seats Quantity: {data.seatsQuantity}</p>
            <ul>
                <div className={"seat-container"}>
                {data.seats.map((seat) => (
                    <div
                        key={seat._id}
                        className={
                            seat.isReserved
                                ? "seat_reserved"
                                : selectedSeats.includes(seat._id)
                                    ? "seat_selected"
                                    : "seat_available"
                        }
                        onClick={() => !seat.isReserved && toggleSeatSelection(seat._id, seat.seatNumber)}
                    >
                        {seat.seatNumber}
                    </div>

                ))}
                </div>
            </ul>
            <button onClick={makeReserv}>Make Reservation</button>
            <Link to={`/reservations/screening/${screeningId}`}>
                <button style={{ padding: '0.5rem 1rem', marginTop: '1rem' }}>
                    Reservations
                </button>
            </Link>
            <h6>{successMessage}</h6>


            <PDFDownloadLink
                document={
                    <MyDocument
                    cd    roomNumber={data.room_id?.roomNumber || "Unknown"}
                        movieTitle={data.movie_id?.title || "Unknown"}
                        time={data.time || "Unknown"}
                        date={data.date?.slice(0, 10) || "Unknown"}
                        selectedSeats={selectedSeatNumbers}
                    />
                }
                fileName="reservation.pdf"
                onClick={() => {
                    // Ustawiamy flagę do odświeżenia po 3 sekundach (czas na generowanie PDF)
                    setTimeout(() => setShouldRefresh(true), 1000);
                }}

            >
                {({ loading }) => (loading ? "Preparing document..." : "Download your reservation as PDF")}

            </PDFDownloadLink>
        </div>
    );
};

export default MakeReservation;
