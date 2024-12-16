
const Movie = require('../models/Movie.model.js')


const getMovies = ((req, res) => {
    Movie.find({})
        .then(result => res.status(200).json({ result }))
        .catch(error => res.status(500).json({msg: error}))
})

const getMovieById = ((req, res) => {
    Movie.findOne({ _id: req.params.id })
        .then(result => res.status(200).json({ result }))
        .catch(() => res.status(404).json({msg: 'Movie not found'}))
})

const createMovie = ((req, res) => {
    Movie.create(req.body)
        .then(result => res.status(201).json({ result }))
        .catch((error) => res.status(500).json({msg:  error }))
})


const updateMovie = ((req, res) => {
    Movie.findOneAndUpdate({ _id: req.params.movieID }, req.body, { new: true, runValidators: true })
        .then(result => res.status(200).json({ result }))
        .catch((error) => res.status(404).json({msg: 'Movie not found' }))
})

const deleteMovie = ((req, res) => {
    Movie.findOneAndDelete({ _id: req.params.id }, req.body, { new: true, runValidators: true })
        .then(result => res.status(200).json({ result }))
        .catch((error) => res.status(404).json({msg: 'Movie not found' }))
})

module.exports = {
    getMovies,
    getMovieById,
    createMovie,
    updateMovie,
    deleteMovie
}