const mongoose = require('mongoose');


const RoomSchema = new mongoose.Schema({
    roomNumber: {
        type: Number,
        required: true,
        unique: true,
    },
    seatsQuantity: {
        type: Number,
        required: true,
        default: 10
    },
    // seats: [
    //     {
    //         seatNumber: { type: Number, required: true },
    //         isReserved: { type: Boolean, default: false }
    //     }
    // ]
});

module.exports = mongoose.model('Room', RoomSchema);