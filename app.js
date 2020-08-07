/**
 * Copyright © StoredIn, 2020
 * Developer: Prashant Shrestha (www.prashant.me)
 * Date: Wed 05 Aug 2020 11:45:54 AM EDT
 * Document: app.js (Entry)
 * Licensed: MIT (Open Source)
 * WEBSITE -- STOREDIN.me (Available)
 */

const express = require('express');
const app = express();
const { DEV, PORT } = require('./config.js');

// Strictly for file & path management.
global.__basedir = __dirname;

// Development mode, use morgan to log requests & requests' type.
if (DEV) {
    const morgan = require('morgan');
    app.use(morgan('dev'));
}

// Importing and using express routes.
const createPasteRoute = require('./routes/route.paste');

// Main page, instructions and such!
app.use('/', createPasteRoute);

// Start server.
app.listen(PORT, () => {
    console.log(
        `Listening on Port: *:${PORT}${
            DEV && DEV === true ? ' in development mode.' : ''
        }`
    );
});
