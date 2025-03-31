const mongoose = require('mongoose');

const ReservationSchema = new mongoose.Schema(
    {
        reservation_string: {
            type: String,
            unique: true,
        },
        reservation_number: {
            type: Number,
            required: false,
        },

        isCancelled: {
            type: Boolean,
            default: false,
        },

        screening_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Screening',
            required: true
        },

        user_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
        seats: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: 'Seat',
            required: true,
        },
    },
    { timestamps: true }
);




// ReservationSchema.index(
//     { screening_id: 1, 'seats.seat_id': 1 },
//     { unique: true}
// );

ReservationSchema.pre('save', async function (next) {
    if (!this.reservation_number) {
        try {
            // Find the last reservation by reservation_number and increment
            const lastReservation = await Reservation.findOne().sort({ reservation_number: -1 });
            this.reservation_number = lastReservation ? lastReservation.reservation_number + 1 : 1;
            this.reservation_string = `reservation:${this.reservation_number}`;
        } catch (err) {
            return next(err); // Pass error to next middleware
        }
    }
    next();
});

const Reservation = mongoose.model('Reservation', ReservationSchema);

module.exports = Reservation;
