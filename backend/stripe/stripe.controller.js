const Reservation = require("../models/Reservation.model");
const mongoose = require("mongoose");
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const getPaymentStripe = async (req, res) => {
    try {
        const { paymentMethodId } = req.body;
        const reservationId = req.params.id;

        // Validate reservationId format
        if (!mongoose.Types.ObjectId.isValid(reservationId)) {
            return res.status(400).json({
                success: false,
                message: "Nieprawidłowy identyfikator rezerwacji"
            });
        }

        // Validate payment method
        if (!paymentMethodId || typeof paymentMethodId !== 'string') {
            return res.status(400).json({
                success: false,
                message: "Nieprawidłowa metoda płatności"
            });
        }

        const reservation = await Reservation.findById(reservationId);
        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: "Rezerwacja nie znaleziona"
            });
        }

        if (reservation.isPaid) {
            return res.status(400).json({
                success: false,
                message: "Rezerwacja została już opłacona"
            });
        }

        const seatQuantity = reservation.seats.length;
        const amount = 10 * 100 * seatQuantity; // 10 PLN per seat in grosze

        // Create and confirm PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'pln',
            payment_method: paymentMethodId,
            confirm: true,
            payment_method_types: ['card'],
            metadata: { reservationId },
            description: `Płatność za rezerwację ${reservationId}`,
            return_url: `${process.env.FRONTEND_URL}/payment/complete/${reservationId}`
        });

        // Handle payment status
        switch (paymentIntent.status) {
            case 'requires_action':
                return res.json({
                    success: true,
                    requiresAction: true,
                    clientSecret: paymentIntent.client_secret,
                    message: "Wymagane dodatkowe potwierdzenie płatności"
                });
            case 'succeeded':
                reservation.isPaid = true;
                reservation.paidAt = new Date();
                reservation.paymentId = paymentIntent.id;
                await reservation.save();
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
                    message: `Nieoczekiwany status płatności: ${paymentIntent.status}`
                });
        }
    } catch (err) {
        console.error("Błąd płatności:", err);
        if (err.raw) {
            console.error("Stripe error:", err.raw);
        }

        return res.status(500).json({
            success: false,
            message: "Wystąpił błąd podczas przetwarzania płatności",
            error: err.message
        });
    }
};

module.exports = { getPaymentStripe };