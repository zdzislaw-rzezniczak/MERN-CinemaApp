const mongoose = require('mongoose');



const ScreeningSchema = new mongoose.Schema({
    movie_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie',
        required: true
    },
    //start and end time
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    room_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    }
});


const Screening = mongoose.model('Screening', ScreeningSchema);


module.exports = Screening;
