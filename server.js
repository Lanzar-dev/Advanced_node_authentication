require('dotenv').config({path: "./config.env"});
const express = require('express');
const router = require('./routes/auth');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

//connect DB
connectDB();

const app = express();

app.use(express.json());

app.use('/api/auth', router);
//this is a protected/private route
app.use('/api/private', require('./routes/private'));

//Error Handler (should be last piece of middleware)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});

//handles error in the connection string of mongoDB
process.on('unhandledRejection', (err, promise) => {
    console.log(`Logged Error: ${err}`);
    server.close(() => process.exit(1));
})
