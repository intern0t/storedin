/**
 * Copyright © StoredIn, 2020
 * Developer: Prashant Shrestha (www.prashant.me)
 * Date: Wed 06 Aug 2020 13:05:54 AM EDT
 * Document: config.js (Entry)
 * Licensed: MIT (Open Source)
 */

module.exports = {
    /* Enable development mode */
    DEV: false,
    /* Specify the port where you want to launch the nodejs server */
    PORT: 3000,
    /* Creation of paste minimum characters and maximum filesize of the paste allowed */
    DATA: {
        min: 50,
        maxPayloadSize: '3mb',
    },
    /* The directory/path you want to store the pastes */
    DIRECTORY: {
        paste: 'paste',
    },
    DOMAIN_BACKUP: 'https://storedin.herokuapp.com/',
    /* Domain you want to use, replace the defaults except for localhost part */
    DOMAIN:
        this.DEV === true
            ? `http://localhost:${this.PORT}/`
            : 'https://paste.prashant.me/',
    /* Whether to show the user how long ago the paste was created. e.g. 1hr ago./1yr ago. */
    OUTPUT: {
        data: false,
    },
    /* Traffic control and limitation section */
    LIMIT: {
        /* How many paste can one IP view in under a specified time window. */
        view: 150,
        /* How many paste can one IP create in under a specific time window.  */
        create: 50,
        /* How long to remember the IP/traffic information. default is 90 seconds. 1.5 mins */
        timeInMs: 900000,
    },
};
