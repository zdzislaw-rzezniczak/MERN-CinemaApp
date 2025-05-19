const mongoose = require('mongoose')

const MovieSchema = new mongoose.Schema({
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        poster_url: {
            type: String,
            required: false,
        },
        duration: {
            type: Number,
            required: true,
        }
    },
    {timestamps: true}
)

const Movie = mongoose.model('Movie', MovieSchema)

module.exports = Movie