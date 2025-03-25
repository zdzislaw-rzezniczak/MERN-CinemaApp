const express = require('express');
const router = express.Router();

const  {
    getMovies,
    getMovieById,
    createMovie,
    updateMovie,
    deleteMovie
} = require('../controllers/movies.conroller')
const isAdmin = require("../middleware/isAdmin.middleware");
const {verifyToken} = require("../middleware/jwt.middleware");

router.get('/',  getMovies)

router.get('/:id', verifyToken, getMovieById)

router.post('/', isAdmin, createMovie)

router.put('/:id', isAdmin, updateMovie)

router.delete('/:id', isAdmin, deleteMovie)


module.exports = router;