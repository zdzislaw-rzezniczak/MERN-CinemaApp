import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useParams } from "react-router-dom";
import CheckoutForm from "./CheckoutForm";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

function PaymentPage() {
    const { reservationId } = useParams(); // Pobierz reservationId z URL

    // Tutaj możesz dodać logikę pobierania kwoty płatności
    // np. z API na podstawie reservationId
    const amount = 1000; // Przykładowa kwota (10.00 PLN w groszach)

    return (
        <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
            <h2>Płatność za rezerwację #{reservationId}</h2>
            <Elements stripe={stripePromise}>
                <CheckoutForm
                    reservationId={reservationId}
                    amount={amount}
                />
            </Elements>
        </div>
    );
}

export default PaymentPage;