const express = require('express');
const router = express.Router();
const paypal = require('@paypal/checkout-server-sdk');
const {client} = require('./paypal.config');
const Reservation = require('../models/reservation.model');


const getReservation = async (req, res, next) => {
    try {
        const reservationId = req.params.id;
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

        req.reservation = reservation;
        next();
    } catch (err) {
        next(err);
    }
};


router.post('/create-payment/:id', getReservation, async (req, res) => {
    const request = new paypal.orders.OrdersCreateRequest();
    const reservation = req.reservation;

    const seatQuantity = reservation.seats.length;
    const amount = (10 * seatQuantity).toFixed(2); // 10 PLN za miejsce

    request.prefer("return=representation");
    request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [{
            amount: {
                currency_code: 'PLN',
                value: amount
            },
            description: `Płatność za rezerwację ${reservation._id}`,
            custom_id: reservation._id.toString()
        }],
        application_context: {
            // return_url: "" ,
            // cancel_url: "" ,
            landing_page: "LOGIN",
            brand_name: "CinemaApp",
            shippinng_prefence: "NO_SHIPPING",
            user_action: "PAY_NOW"
        }
    });

    try {

        const order = await client.execute(request);
        res.json({
            success: true,
            orderID: order.result.id
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

// Finalizacja płatności
router.post('/capture-payment/:orderID', async (req, res) => {
    try {
        const {orderID} = req.params;
        const request = new paypal.orders.OrdersCaptureRequest(orderID);
        request.requestBody({});

        const capture = await client.execute(request);
        const captureResult = capture.result;

        console.log('PayPal capture response:', JSON.stringify(captureResult, null, 2));

        // Pobieranie custom_id (czyli ID rezerwacji)
        const reservationId = captureResult.purchase_units[0].payments.captures[0].custom_id;

        if (!reservationId) {
            throw new Error('Brak custom_id w odpowiedzi PayPal');
        }


        // Aktualizacja rezerwacji
        const updateResult = await Reservation.findByIdAndUpdate(
            reservationId,
            {
                isPaid: true,
                paidAt: new Date(),
                paymentId: orderID,
                paymentStatus: 'COMPLETED',
                paymentDetails: captureResult
            },
            {new: true, runValidators: true}
        );

        if (!updateResult) {
            throw new Error('Aktualizacja rezerwacji nie powiodła się - brak rekordu');
        }

        console.log('Successfully updated reservation:', updateResult);

        res.json({
            success: true,
            message: 'Płatność i aktualizacja rezerwacji zakończone sukcesem',
            details: {
                payment: captureResult,
                reservation: {
                    id: updateResult._id,
                    isPaid: updateResult.isPaid,
                    updatedAt: updateResult.updatedAt
                }
            }
        });

    } catch (err) {
        console.error('Full error during payment capture:', {
            error: err,
            stack: err.stack,
            orderID: req.params.orderID
        });

        // Aktualizacja statusu rezerwacji w przypadku niepowodzenia
        try {
            const failedUpdate = await Reservation.findOneAndUpdate(
                {paymentId: req.params.orderID},
                {paymentStatus: 'FAILED', paymentError: err.message},
                {new: true}
            );
            console.log('Failed payment update attempt:', failedUpdate);
        } catch (dbErr) {
            console.error('Error updating failed payment status:', dbErr);
        }

        res.status(500).json({
            success: false,
            message: "Błąd podczas przetwarzania płatności",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined,
            debugInfo: process.env.NODE_ENV === 'development' ? {
                orderID: req.params.orderID,
                errorDetails: err.response?.details
            } : undefined
        });
    }
});

module.exports = router;
