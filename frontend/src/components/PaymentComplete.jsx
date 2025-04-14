import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const PaymentComplete = () => {
    const { reservationId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate("/screenings");
        }, 3000);

        return () => clearTimeout(timer);
    }, [navigate]);

    const handleManualRedirect = () => {
        navigate("/screenings");
    };

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h2>Płatność zakończona sukcesem!</h2>
            <p>ID rezerwacji: {reservationId}</p>
            <p>Za chwilę zostaniesz przekierowany na listę seansów...</p>
            <button
                onClick={handleManualRedirect}
                style={{
                    marginTop: "20px",
                    padding: "10px 20px",
                    fontSize: "16px",
                    cursor: "pointer"
                }}
            >
                Wróć do seansów teraz
            </button>
        </div>
    );
};

export default PaymentComplete;
