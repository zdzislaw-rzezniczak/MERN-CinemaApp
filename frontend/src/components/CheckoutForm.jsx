import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useState } from "react";
import { useNavigate } from "react-router-dom";


const CheckoutForm = ({ reservationId, amount }) => {

    const navigate = useNavigate();
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError("");

        try {
            // 1. Validate Stripe is ready
            if (!stripe || !elements) {
                throw new Error("Stripe not initialized");
            }

            // 2. Create PaymentMethod
            const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card: elements.getElement(CardElement),
            });
            if (pmError) throw pmError;


            console.log("Sending payment request:", {
                paymentMethodId: paymentMethod.id,
                amount: amount
            });
            // 3. Call your backend
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}stripe/${reservationId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${sessionStorage.getItem('authToken')}`
                },
                body: JSON.stringify({
                    paymentMethodId: paymentMethod.id,
                    amount: amount
                }),
            });

            // 4. Handle response
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Payment failed");
            }

            const data = await response.json();

            // 5. Handle 3D Secure if needed
            if (data.requiresAction) {
                const { error: confirmError } = await stripe.confirmCardPayment(
                    data.clientSecret,
                    {
                        payment_method: paymentMethod.id,
                        return_url: `${window.location.origin}/payment/complete/${reservationId}`,
                    }
                );
                if (confirmError) throw confirmError;
            }

            // 6. Handle immediate success
            navigate(`/payment/success/${reservationId}`);

        } catch (err) {
            console.error("Payment error:", err);
            setError(err.message || "Payment failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <CardElement options={{
                style: {
                    base: {
                        fontSize: '16px',
                        color: '#424770',
                        '::placeholder': { color: '#aab7c4' },
                    },
                },
                hidePostalCode: true
            }} />
            <button type="submit" disabled={!stripe || loading}>
                {loading ? 'Processing...' : `Pay 10 PLN/seat`}
            </button>
            {error && <div className="error-message">{error}</div>}
        </form>
    );
};

export default CheckoutForm;