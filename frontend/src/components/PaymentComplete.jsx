import {useParams} from "react-router-dom";

const PaymentComplete = () => {
    const { reservationId } = useParams();
    return (
        <div>
            <h2>Payment Completed!</h2>
            <p>Reservation ID: {reservationId}</p>
        </div>
    );
};

export default PaymentComplete;