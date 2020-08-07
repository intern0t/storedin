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
};
