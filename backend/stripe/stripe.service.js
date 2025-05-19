const Reservation = require("../models/reservation.model");

class StripeService {
    constructor(stripe) {
        this.stripe = stripe;
    }

    async processPayment({paymentMethodId, reservationId}) {
        const reservation = await Reservation.findById(reservationId);

        if (!reservation) throw new Error("Rezerwacja nie znaleziona");
        if (reservation.isPaid) throw new Error("Rezerwacja została już opłacona");

        const amount = 10 * 100 * reservation.seats.length;

        const paymentIntent = await this.stripe.paymentIntents.create({
            amount,
            currency: 'pln',
            payment_method: paymentMethodId,
            confirm: true,
            payment_method_types: ['card'],
            metadata: {reservationId},
            description: `Płatność za rezerwację ${reservationId}`,
            return_url: `${process.env.FRONTEND_URL}/payment/complete/${reservationId}`
        });

        return {paymentIntent, reservation};
    }

    async updateReservationAfterPayment(reservation, paymentIntent) {
        reservation.isPaid = true;
        reservation.paidAt = new Date();
        reservation.paymentId = paymentIntent.id;
        await reservation.save();
    }
}

module.exports = StripeService;