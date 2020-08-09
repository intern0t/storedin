/**
 * Copyright © StoredIn, 2020
 * Developer: Prashant Shrestha (www.prashant.me)
 * Date: Wed 06 Aug 2020 13:05:54 AM EDT
 * Document: config.js (Entry)
 * Licensed: MIT (Open Source)
 */

module.exports = {
    DEV: false, //process.env.NODE_ENV === 'development',
    PORT: 9999,
    DATA: {
        min: 50,
        maxPayloadSize: '3mb',
    },
    DIRECTORY: {
        paste: 'paste',
    },
    DOMAIN:
        this.DEV === true ? 'http://localhost:9999/' : 'https://storedin.me/',
    OUTPUT: {
        data: false,
    },
    LIMIT: {
        view: 150,
        create: 50,
        timeInMs: 900000
    }
};
