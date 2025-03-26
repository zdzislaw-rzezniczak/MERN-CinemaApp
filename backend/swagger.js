const swaggerAutogen = require('swagger-autogen')();

const doc = {
    info: {
        title: 'My API',
        description: 'Description'
    },
    host: 'localhost:3000'
};

const outputFile = './swagger.json';
const routes = ['./routes/auth.routes.js', "./routes/movies.routes.js", "./routes/reservation.routes.js", "./routes/room.routes.js", "./routes/screenings.routes.js"];

swaggerAutogen(outputFile, routes, doc);