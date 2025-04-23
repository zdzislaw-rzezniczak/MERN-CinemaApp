const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const {createSecretToken} = require('../token_generation/generateToken');

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

const createUser = async (req, res) => {
    try {
        const {email, password, username} = req.body;

        // Sprawdzenie poprawności otrzymanych danyhch
        if (!email || !password || !username) {
            return res.status(400).json({message: "All fields are required."});
        }

        // Sprawdzenie czy użytkownik już istnieje
        const [existingUser, usernameTaken] = await Promise.all([
            User.findOne({email}),
            User.findOne({username}),
        ]);

        if (existingUser) {
            return res.status(409).json({message: "Email already exists."});
        }

        if (usernameTaken) {
            return res.status(409).json({message: "Username already taken."});
        }

        // Zahash hasła
        const hashedPassword = await bcrypt.hash(password, 10);

        // Stworzenie nowego użytkownika
        const user = await new User({
            username,
            email,
            password: hashedPassword,
        }).save();

        // Generate token
        const token = createSecretToken(user._id);

        res.cookie("token", token, {
            path: "/",
            expires: new Date(Date.now() + ONE_DAY_IN_MS),
            secure: true,
            httpOnly: true,
            sameSite: "None",
        });

        console.log("Cookie set successfully");
        res.status(201).send(`User created: ${user.username}`);

    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({message: "Internal server error"});
    }
};

module.exports = createUser;