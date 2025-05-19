const express = require('express');
const router = express.Router();
const isAdmin = require("../middleware/auth.middleware");
const {verifyToken} = require("../middleware/jwt.middleware");


const {
    createRoom,
    getRooms,
    getRoomDetails
} = require('../controllers/screenings.controller.js')


router.get('/', getRooms)


router.post('/room', isAdmin, createRoom)

router.get('/room/:id', verifyToken, getRoomDetails)


module.exports = router