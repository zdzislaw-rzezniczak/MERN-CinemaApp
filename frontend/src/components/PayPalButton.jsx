import { useState } from 'react';
import axios from 'axios';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { useParams } from 'react-router-dom';

const PayPalButton = () => {
    const [success, setSuccess] = useState(false);
    const { reservationId } = useParams();

    const createOrder = async () => {
        try {
            const { data } = await axios.post(`http://localhost:5000/api/payments/create-payment/${reservationId}`);
            return data.orderID;
        } catch (err) {
            console.error(err);
        }
    };

    const onApprove = async (data) => {
        try {
            await axios.post(`http://localhost:5000/api/payments/capture-payment/${data.orderID}`);
            setSuccess(true);
        } catch (err) {
            console.error(err);
        }
    };

    return (

        <PayPalScriptProvider options={{ "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID, currency: "PLN" }}>
            {success ? (
                <div>Płatność zakończona sukcesem!</div>
            ) : (
                <PayPalButtons

                    createOrder={createOrder}
                    onApprove={onApprove}
                />
            )}
        </PayPalScriptProvider>
    );
};

export default PayPalButton;
