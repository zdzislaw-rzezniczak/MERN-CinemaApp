import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useParams } from "react-router-dom";
import CheckoutForm from "./CheckoutForm";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

function PaymentPage() {
    const { reservationId } = useParams();


    const amount = 1000; //10zł

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