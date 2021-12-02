/**
 * Copyright © StoredIn, 2020
 * Developer: Prashant Shrestha (www.prashant.me)
 * Date: Wed 05 Aug 2020 11:45:54 AM EDT
 * Document: app.js (Entry)
 * Licensed: MIT (Open Source)
 */

const express = require('express');
const app = express();
const fs = require('fs');
const { DEV, PORT, DIRECTORY } = require('./config.js');

// Strictly for file & path management.
global.__basedir = __dirname;

// Heroku port specification.
PORT = process.env.PORT || PORT

// Development mode, use morgan to log requests & requests' type.
if (DEV) {
    const morgan = require('morgan');
    app.use(morgan('dev'));
}

// Setup the directory.. if it doesn't exist. Blocks the app but worth it for start.
if (!fs.existsSync(`${__basedir}/${DIRECTORY.paste}`)) {
    fs.mkdirSync(`${__basedir}/${DIRECTORY.paste}`);
}

// Importing and using express routes.
const singleRouter = require('./routes/route.paste');

// Main page, instructions and such!
app.use('/', singleRouter);

// Start server.
app.listen(PORT, () => {
    console.log(
        `Listening on Port: *:${PORT}${
            DEV && DEV === true ? ' in development mode.' : ''
        }`
    );
});
