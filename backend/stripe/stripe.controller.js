const createStripeClient = require("./stripe.factory");
const StripeService = require("./stripe.service");

const stripe = createStripeClient();
const stripeService = new StripeService(stripe);

const getPaymentStripe = async (req, res) => {
    try {
        const {paymentMethodId} = req.body;
        const {id: reservationId} = req.params;

        const {paymentIntent, reservation} = await stripeService.processPayment({
            paymentMethodId,
            reservationId
        });

        switch (paymentIntent.status) {
            case 'requires_action':
                return res.json({
                    success: true,
                    requiresAction: true,
                    clientSecret: paymentIntent.client_secret,
                    message: "Wymagane dodatkowe potwierdzenie płatności"
                });
            case 'succeeded':
                await stripeService.updateReservationAfterPayment(reservation, paymentIntent);
                return res.json({
                    success: true,
                    message: "Płatność zakończona sukcesem",
                    paymentIntent
                });
            case 'requires_payment_method':
                return res.status(400).json({
                    success: false,
                    message: "Płatność nie powiodła się. Wybierz inną metodę."
                });
            case 'canceled':
                return res.status(400).json({
                    success: false,
                    message: "Płatność została anulowana."
                });
            default:
                return res.status(400).json({
                    success: false,
                    message: `Nieoczekiwany status: ${paymentIntent.status}`
                });
        }
    } catch (err) {
        console.error("Błąd płatności:", err);
        return res.status(500).json({
            success: false,
            message: "Wystąpił błąd podczas przetwarzania płatności",
            error: err.message
        });
    }
};

module.exports = {getPaymentStripe};