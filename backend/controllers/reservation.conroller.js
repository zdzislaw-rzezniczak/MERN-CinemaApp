
const Reservation = require('../models/Reservation.model')
const Room = require('../models/Room.model')
const Screening = require('../models/Screening.model')
const mongoose = require("mongoose");

const getReservations = ((req, res) => {
    Reservation.find({})
        .then(result => res.status(200).json({ result }))
        .catch(error => res.status(500).json({msg: error}))
})


const getReservationsByScreeningId = async (req, res) => {
    const id =  req.params.screeningId

    // const objectId = new Types.ObjectId(id);

    try {
        const reservations = await Reservation.find({screening_id: id})
            .populate('user_id', 'username email')
            .populate('seat_id')
            .populate({
                path : 'screening_id',
                    populate : {
                        path : 'movie_id'},


            })





        console.log(reservations);
        if (!reservations) {
            return res.status(404).json({message: 'No reservation found for this screening.'});
        }


        res.status(200).json({
            reservations,
           // Zarezerwowane miejsca z numerem i statusem
        });
              // Send back the reservation data

    } catch (error) {
        console.error("Error fetching reservations:", error);
        res.status(500).json({error: 'Failed to fetch reservations.'});
    }
};


const getReservationById = ((req, res) => {
    Reservation.findOne({ _id: req.params.id })
        .then(result => res.status(200).json({ result }))
        .catch(() => res.status(404).json({msg: 'Reservation not found'}))
})


const createReservation = async (req, res) => {
    const { screening_id, seats, user_id } = req.body;


    try {


       const screening = await Screening.findById(screening_id);
        const room = await Room.findById(screening.room_id.toString());
        // console.log(room)

        if (!room) {
            return res.status(404).json({ msg: 'Room not found.' });
        }

        if (!Array.isArray(seats) || seats.some(seat => !mongoose.Types.ObjectId.isValid(seat))) {
            return res.status(400).json({ msg: 'Invalid seat IDs provided.' });
        }

        // Find reservations for the same screening with overlapping seats
        const existingReservations = await Reservation.find({
            screening_id,
            seats: { $in: seats },
        });

        if (existingReservations.length > 0) {
            return res.status(400).json({ msg: 'One or more seats are already reserved for this screening.' });
        }
        // console.log(seats)
        seats.forEach(chosenSeat => {
            // console.log(chosenSeat);
            if (!chosenSeat) {
                console.error('Chosen seat has no _id:', chosenSeat);
                return;
            }

            room.seats.forEach(seat => {
                    // console.log(seat._id.toString());
                    // console.log(chosenSeat._id);
                if(seat._id.toString() === chosenSeat) {
                    seat.isReserved = true;
                    console.log(seat);
                }
            });

        });

        room.save();

        // Create the new reservation
        const newReservation = new Reservation({
            screening_id,
            seats,
            user_id,
        });

        const savedReservation = await newReservation.save();

        res.status(201).json(savedReservation);
    } catch (error) {
        console.error('Error creating reservation:', error);
        res.status(500).json({ msg: 'Failed to create reservation', error });
    }
};





















const updateReservation= ((req, res) => {
    Reservation.findOneAndUpdate({ _id: req.params.reservationID }, req.body, { new: true, runValidators: true })
        .then(result => res.status(200).json({ result }))
        .catch((error) => res.status(404).json({msg: 'Reservation not found' }))
})

const deleteReservation = ((req, res) => {
    Reservation.findOneAndDelete({ _id: req.params.id }, req.body, { new: true, runValidators: true })
        .then(result => res.status(200).json({ result }))
        .catch((error) => res.status(404).json({msg: 'Reservation not found' }))
})

module.exports = {
    getReservations,
    getReservationById,
    createReservation,
    updateReservation,
    deleteReservation,
    getReservationsByScreeningId
}