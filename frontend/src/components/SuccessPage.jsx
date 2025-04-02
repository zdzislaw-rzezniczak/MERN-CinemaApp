// SuccessPage.jsx
import { useParams } from "react-router-dom";

const PaymentSuccess = () => {
    const { reservationId } = useParams();
    return (
        <div>
            <h2>Payment Successful!</h2>
            <p>Reservation ID: {reservationId}</p>
        </div>
    );
};

export default PaymentSuccess
