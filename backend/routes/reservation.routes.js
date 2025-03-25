const express = require('express');
const router = express.Router();

const  {
    getReservations,
    getReservationById,
    createReservation,
    updateReservation,
    deleteReservation, getReservationsByScreeningId
} = require('../controllers/reservation.conroller')
const isAdmin = require("../middleware/isAdmin.middleware");
const {verifyToken} = require("../middleware/jwt.middleware");

router.get('/', verifyToken, getReservations)

router.get('/:id', verifyToken, getReservationById)

router.post('/', verifyToken, createReservation)

router.put('/:id', isAdmin, updateReservation)

router.delete('/:id', isAdmin, deleteReservation)

router.get('/screening/:screeningId', verifyToken, getReservationsByScreeningId);


module.exports = router;