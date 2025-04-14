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
import PaymentPage from "./components/Stripe.jsx";
import PaymentSuccess from "./components/SuccessPage.jsx";
import PaymentComplete from "./components/PaymentComplete.jsx";

import {PayPalScriptProvider} from "@paypal/react-paypal-js"
import PayPalButton from './components/PayPalButton';

const initialOptions = {
    "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID ,
    currency: "PLN",
    intent: "capture",
};

function App() {
    const [token, setToken] = useState(sessionStorage.getItem('authToken') || null);

    const fetchInfo = async (url) => {
        const token = sessionStorage.getItem('authToken');

        const headers = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, { headers });
            if (!response.ok) {
                throw new Error(response.status === 401 ? 'Unauthorized' : 'Request failed');
            }
            return await response.json();
        } catch (error) {
            console.error(`Error fetching ${url}:`, error);
            throw error;
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
                    path="stripe/:reservationId"
                    element={
                        <PrivateRoute token={token}>
                            <PaymentPage onLogout={handleLogout} fetchInfo={fetchInfo} />
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
                <Route path="/payment/complete/:reservationId" element={<PaymentComplete />} />
                <Route path="/payment/success/:reservationId" element={<PaymentSuccess />} />



                <Route
                    path="/paypal/:reservationId"
                    element={
                        <PayPalScriptProvider options={initialOptions}>
                            <PayPalButton />
                        </PayPalScriptProvider>
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
