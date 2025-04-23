const express = require('express');
const router = express.Router();

const {
    getReservations,
    getReservationById,
    createReservation,
    updateReservation,
    deleteReservation,
    getReservationsByScreeningId,
    getReservationByUserId,
    cancelReservation
} = require('../controllers/reservation.controller')
const isAdmin = require("../middleware/auth.middleware");
const {verifyToken} = require("../middleware/jwt.middleware");

router.get('/', verifyToken, getReservations)

router.get('/:id', verifyToken, getReservationById)
router.patch('/cancel/:id', verifyToken, cancelReservation)

router.get('/user/:id', verifyToken, getReservationByUserId)

router.post('/', verifyToken, createReservation)

router.put('/:id', isAdmin, updateReservation)

router.delete('/:id', isAdmin, deleteReservation)

router.get('/screening/:screeningId', verifyToken, getReservationsByScreeningId);


module.exports = router;