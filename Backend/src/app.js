const express = require('express');
require('dotenv').config();
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const routes = require('./routes');

const app = express();
const defaultPort = 3000;
const port = process.env.PORT || defaultPort;

const db = require('./db');

// Enable CORS
app.use(cors());

// Use Helmet middleware
app.use(helmet());

// Use Morgan for logging
app.use(morgan('combined'));

app.use(express.json());
app.use('/api', routes);


// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

// Start the server
app.listen(port, () => {
    const serverUrl = `http://localhost:${port}`;
    console.log(`Server is running on ${serverUrl}`);
});

module.exports = app;
