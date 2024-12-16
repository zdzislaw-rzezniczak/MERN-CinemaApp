const express = require('express')
const router = express.Router()

const {verifyToken} = require("../middleware/jwt.middleware");
const isAdmin = require("../middleware/isAdmin.middleware");

const  {
    getScreenings,
    getScreeningByID,
    createScreening,
    updateScreening,
    deleteScreening,
    createRoom,
    getRoomDetails
} = require('../controllers/screenings.controller.js')






router.get('/', verifyToken,  getScreenings)

router.get('/:id', verifyToken, getScreeningByID)

router.post('/', isAdmin, createScreening)

router.post('/room', isAdmin, createRoom)

router.get('/room/:id', verifyToken, getRoomDetails)


router.put('/:id', isAdmin, updateScreening)
//
router.delete('/:id', isAdmin, deleteScreening)

module.exports = router