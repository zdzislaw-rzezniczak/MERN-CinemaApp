const User = require('../models/User.model');

const {createSecretToken} = require('../token_generation/generateToken')
const bcrypt = require('bcryptjs');


const createUser = async (req, res) => {
    // pobranie danych od użytkownika
    // sprawdzenie poprawności otrzymanych danyhch
    try {
        if (
            !(
                req.body.email &&
                req.body.password &&
                req.body.username
            )
        ) {
            res.status(400).send("All fields are required");
        }

        //sprawdzenie czy użytkownik już istnieje
        const existingUser = await User.findOne({ email: req.body.email });

        if (existingUser) {
            return res.status(409).json({ message: "Email already exists" });
        }

        const usernameTaken = await User.findOne({ username: req.body.username });
        if (usernameTaken) {
            return res.status(409).json({message: "Username already taken" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(req.body.password, salt);


        const newUser = new User({

            username: req.body.username,
            email: req.body.email,
            password: hashPassword,

        });
        //zapis użytkownika do bazy
        const user = await newUser.save();
        const token = createSecretToken(user._id);

        res.cookie("token", token, {
            path: "/", // Cookie is accessible from all paths
            expires: new Date(Date.now() + 86400000), // Cookie expires in 1 day
            secure: true, // Cookie will only be sent over HTTPS
            httpOnly: true, // Cookie cannot be accessed via client-side scripts
            sameSite: "None",
        });

        console.log("cookie set succesfully");
        res.status(201).send("User created: " + user.username);
    }
    catch (error) {
        console.error('Error creating user:', error);}

};
module.exports = createUser;
