const Screening = require('../models/Screening.model');
const Room = require('../models/Room.model');
const Movie = require("../models/Movie.model");
const Seat = require("../models/Room.model");
const {populate} = require("dotenv");
const req = require("express/lib/request");

const getScreenings = async (req, res) => {
    try {
        const screenings = await Screening.find()
            .populate('movie_id', 'title description') // Pobiera tytuł filmu
             // Pobiera numer pokoju
        console.log(screenings)
        res.status(200).json({ result: screenings });

    } catch (err) {
        console.error('Error fetching screenings:', err.message);
        res.status(500).json({ error: 'Failed to fetch screenings.' });
    }
};

const getScreeningByID = async (req, res) => {
   await Screening.findOne({ _id: req.params.id })
       .populate("room_id")
       .populate('seat_id')
       .populate("movie_id")
       .populate("room_id")
        .then(result => {
            if (!result) {
                return res.status(404).json({ msg: 'Screening not found' });
            }
            res.status(200).json({ result });
        })

        .catch(error => res.status(500).json({ msg: 'Error fetching screening', error }));
};

const updateScreening = ((req, res) => {
    Screening.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true, runValidators: true })
        .then(result => res.status(201).json({ result }))
        .catch((error) => res.status(404).json({msg: 'Screening not found', error }))
})

const deleteScreening = async (req, res) => {
    Screening.findOneAndDelete({ _id: req.params.id })
        .then(result => {
            if (!result) {
                return res.status(404).json({ msg: 'Screening not found' });
            }
            res.status(200).json({ result });
        })
        .catch(error => res.status(500).json({ msg: 'Error fetching screening', error }));
};



const createRoom = async (req, res) => {
    try {
        const { roomNumber, seatsQuantity } = req.body;

        if (!roomNumber || typeof roomNumber !== 'number') {
            return res.status(400).json({ msg: "Room number is required and must be a number." });
        }

        if (!seatsQuantity || typeof seatsQuantity !== 'number' || seatsQuantity <= 0) {
            return res.status(400).json({ msg: "Seats quantity must be a positive number." });
        }

        // Generate seats directly in the Room schema
        const seats = Array.from({ length: seatsQuantity }, (_, i) => ({
            seatNumber: i + 1,
            isReserved: false
        }));

        // Create the room with generated seats
        const room = new Room({
            roomNumber,
            seatsQuantity,
            seats,
        });

        const savedRoom = await room.save();

        res.status(201).json(savedRoom);
    } catch (error) {
        console.error('Error creating room:', error);
        res.status(500).json({ msg: 'Failed to create room', error });
    }
};



const createScreening = async (req, res) => {
    try {
        const { movie_id, room_id, date, time } = req.body;


        const [movie, room] = await Promise.all([
            Movie.findById(movie_id),
            Room.findById(room_id).populate('seats')
        ]);

        if (!movie) return res.status(404).json({ msg: 'Movie not found' });
        if (!room) return res.status(404).json({ msg: 'Room not found' });


        const seatAvailability = {};
        room.seats.forEach(seat => {
            seatAvailability[seat._id] = true;
        });


        const newScreening = new Screening({
            movie_id,
            date,
            time,
            room_id,
            seatAvailability
        });

        const savedScreening = await newScreening.save();
        res.status(201).json(savedScreening);
    } catch (error) {
        console.error('Error creating screening:', error);
        res.status(500).json({ msg: 'Failed to create screening', error });
    }



};

const getRoomDetails = async (req, res) => {
    const roomId  = req.params.id; // Assuming roomId is passed as a parameter in the request.

    console.log(roomId);
    try {
        const room = await Room.findById(roomId)
            .populate({
                path: 'seats', // Populate the seats array
                select: 'seatNumber isReserved' // Only include specific fields
            });

        if (!room) {
            return res.status(404).json({ msg: 'Room not found' });
        }

        res.status(200).json(room); // Respond with the populated room details
    } catch (error) {
        console.error('Error fetching room details:', error);
        res.status(500).json({ msg: 'Failed to fetch room details', error });
    }
};

const getRooms = async (req, res) => {
    try {
        const rooms = await Room.find(); // Pobiera wszystkie sale kinowe
        res.json(rooms);
    } catch (error) {
        console.error('Error fetching rooms:', error);
        res.status(500).json({ message: 'Server error' });
    }
};



module.exports = { getRooms, getRoomDetails, createScreening, getScreenings, getScreeningByID, deleteScreening, updateScreening, createRoom};
