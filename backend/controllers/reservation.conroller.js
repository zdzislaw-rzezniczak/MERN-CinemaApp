const Reservation = require('../models/Reservation.model')
const Screening = require('../models/Screening.model')
const User = require('../models/User.model')
const nodemailer = require('nodemailer');
const Movie  = require("../models/Movie.model");



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

    try {
        const { screening_id, user_id, seats } = req.body;

        // console.log("Received Reservation Request:", req.body);

        if (!seats || !Array.isArray(seats)) {
            return res.status(400).json({ msg: "Invalid seats data. Expected an array." });
        }

        // Pobierz seans z bazy danych
        const screening = await Screening.findById(screening_id);
        if (!screening) {
            return res.status(404).json({ msg: "Screening not found" });
        }

        console.log("Screening found:", screening);


        const reservations = await Reservation.find({screening_id: screening_id})
            .populate('user_id', 'username email')
            .populate('seat_id')
            .populate({
                path : 'screening_id',
                populate : {
                    path : 'movie_id'},


            })


        // Aktualizuj status rezerwacji dla wybranych miejsc
        screening.seats.forEach((seat) => {
            if (seats.includes(String(seat._id))) {
                console.log("Marking seat as reserved:", seat._id);
                seat.isReserved = true;
            }
        });

        // Zapisz zmiany w bazie danych
        await screening.save();

        // **Zapisanie rezerwacji w bazie**
        const newReservation = new Reservation({
            screening_id,
            user_id,
            seats
        });

        const savedReservation = await newReservation.save();

        res.status(201).json({ msg: "Reservation successful!", savedReservation });
        //
        // res.status(201).json({ msg: "Reservation successful!", updatedScreening: screening });

        // MAIL

            const user = await User.findById(user_id);
            if (!user) {
                console.error("User not found for email notification");
                return res.status(201).json({
                    msg: "Reservation successful but user not found for email notification",
                    reservations: createdReservations
                });
            }

            const movie = await Movie.findById(screening.movie_id)

            const screeningInfo = `Numer rezerwacji ${savedReservation.reservation_number}. Film: ${movie.title}, Data: ${screening.date.toDateString()}, Godzina: ${screening.time}`;
            const text = `Drogi ${user.username},\nTwoja rezerwacja została potwierdzona.\n\n${screeningInfo}\n\nDziękujemy za skorzystanie z naszego kina!`;




        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.APP_PASS_GMAIL
            }
        });

        const mailOptions = {
            from: process.env.EMAIL,
            to: user.username,
            subject: 'Potwierdzenie rezerwacji',
            text: text
        };


        // Wysyłanie e-maila i obsługa odpowiedzi
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Błąd wysyłki maila:', error);
                return res.status(500).json({ message: 'Błąd wysyłki maila', error });
            }
            console.log('Email wysłany:', info.response);
            return res.status(201).json({ message: 'Rezerwacja utworzona i mail wysłany!', reservation });
        });




    } catch (error) {
        console.error("Error creating reservation:", error);
        res.status(500).json({ msg: "Server error", error });
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