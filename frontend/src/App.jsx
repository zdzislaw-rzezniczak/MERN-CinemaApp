import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Login from './components/Login';
import Signup from './components/Signup';
import Movies from './components/Movies';
import Screenings from './components/Screenings';
import PrivateRoute from './components/PrivateRoute';
import Reservation from "./components/Reservation.jsx";
import MakeReservation from "./components/MakeReservation.jsx";
import CreateMovie from "./components/CreateMovie.jsx";
import CreateScreening from "./components/MakeScreening.jsx";
import './index.css';



function App() {
    const [token, setToken] = useState(sessionStorage.getItem('authToken') || null);

    const fetchInfo = async (url) => {
        const token = sessionStorage.getItem('authToken');
        if (!token) {
            console.error('No token found.');
            return [];
        }

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Unauthorized');
            }

            const item = await response.json();
            // console.log('Full Response:', JSON.stringify(item, null, 2));
            return item; // Return the result array
        } catch (err) {
            console.error('Error fetching info:', err.message);
            return [];
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem('authToken');
        setToken(null);
    };

    return (
        <>

        <BrowserRouter>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Login token={token} setToken={setToken} />} />
                <Route path="signup" element={<Signup />} />

                {/* Protected Routes */}
                <Route
                    path="movies"
                    element={
                        <PrivateRoute token={token}>
                            <Movies onLogout={handleLogout} fetchInfo={fetchInfo} />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="movies/add"
                    element={
                        <PrivateRoute token={token}>
                            <CreateMovie onLogout={handleLogout} fetchInfo={fetchInfo} />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="screenings"
                    element={
                        <PrivateRoute token={token}>
                            <Screenings onLogout={handleLogout} fetchInfo={fetchInfo} />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="reservations/screening/:screeningId"
                    element={
                        <PrivateRoute token={token}>
                            <Reservation fetchInfo={fetchInfo} />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="reservations/room/:roomId/:screeningId"
                    element={
                        <PrivateRoute token={token}>
                            <MakeReservation fetchInfo={fetchInfo}/>
                        </PrivateRoute>
                    }
                />

                <Route
                    path="screenings/make"
                    element={
                        <PrivateRoute token={token}>
                            <CreateScreening fetchInfo={fetchInfo} />
                        </PrivateRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
        </>
    );
}

export default App;
