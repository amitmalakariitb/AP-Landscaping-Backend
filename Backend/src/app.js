const express = require('express');
const session = require('express-session');
const passport = require('../src/middlewares/passport');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const routes = require('./routes');
const http = require('http');
const { initWebSocket } = require('../src/middlewares/webSocket');
require('dotenv').config();

const secretKey = process.env.JWT_SECRET;

const app = express();
const defaultPort = 3000;
const port = process.env.PORT || defaultPort;
const db = require('./db');

const server = http.createServer(app);

// Initialize WebSocket
initWebSocket(server);

// Enable CORS
app.use(cors());

// Use Helmet middleware
app.use(helmet());

// Use Morgan for logging
app.use(morgan('combined'));



app.use(session({
    secret: secretKey,
    resave: false,
    saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());


app.use(express.json());
app.use('/api', routes);

app.get('/', (req, res) => {
    res.send('Welcome to the Ap_Landscaping Backend, You can access the urls defined in the backend through this domain.');
});


// Start the server
app.listen(port, () => {
    const serverUrl = `http://localhost:${port}`;
    console.log(`Server is running on ${serverUrl}`);
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

module.exports = app;
