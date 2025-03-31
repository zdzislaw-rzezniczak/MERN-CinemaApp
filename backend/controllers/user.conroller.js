
const User = require('../models/User.model.js')


const getUsers = ((req, res) => {
    User.find({})
        .then(result => res.status(200).json({ result }))
        .catch(error => res.status(500).json({msg: error}))
})

const getUserById = ((req, res) => {
    User.findOne({ _id: req.params.id })
        .then(result => res.status(200).json({ result }))
        .catch(() => res.status(404).json({msg: 'Movie not found'}))
})


module.exports = {
    getUsers,
    getUserById,
}