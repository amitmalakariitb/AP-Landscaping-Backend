const express = require('express');
// const routes = require('../src/routes');

const app = express();
const defaultPort = 3000;
const port = process.env.PORT || defaultPort;

const db = require('./db');

// app.use('/api', routes);

app.use(express.json());


// Start the server
app.listen(port, () => {
    const serverUrl = `http://localhost:${port}`;
    console.log(`Server is running on ${serverUrl}`);
});

module.exports = app;
