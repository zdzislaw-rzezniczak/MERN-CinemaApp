const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require("mongoose");
require('dotenv').config();
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser");


port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.listen(port, () => {
    console.log(`CinemaApp listening at http://localhost:${port}`);
});


mongoose.set("strictQuery", false);
mongoose.set('strictPopulate', false);
const mongoDB = process.env.MONGODB;
main().catch((err) => console.log(err));
async function main() {
    await mongoose.connect(mongoDB);
    console.log("connected to mongodb");
}

app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use((req, res, next) => {
    // Set CORS headers
    res.header("Access-Control-Allow-Origin", process.env.FRONTEND_URL); // Replace with your frontend domain
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Credentials", "true"); // Allow credentials (cookies, etc.)

    // Pass to next layer of middleware
    next();
});


const moviesRoutes = require('./routes/movies.routes');
app.use('/api/movies', moviesRoutes);

const screeningsRoutes = require('./routes/screenings.routes');
app.use('/api/screenings', screeningsRoutes);

const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);

const reservationsRoutes = require('./routes/reservation.routes');
app.use('/api/reservations', reservationsRoutes);