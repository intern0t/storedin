/**
 * Copyright © StoredIn, 2020
 * Developer: Prashant Shrestha (www.prashant.me)
 * Date: Wed 05 Aug 2020 01:07:43 PM EDT
 * Document: route.paste.js (Entry)
 * Licensed: MIT (Open Source)
 */

const pasteRouter = require('express-promise-router')();
const bodyParser = require('body-parser');
const { v1, validate } = require('uuid');
const shortid = require('shortid');
const path = require('path');
const fs = require('fs');
const dayjs = require('dayjs');
var relativeTime = require('dayjs/plugin/relativeTime');
const { DATA, DIRECTORY, DOMAIN, OUTPUT } = require('../config');
const { format } = require('path');

// Setting up daysjs
dayjs.extend(relativeTime);

// In order to accept POST requests.
pasteRouter.use(bodyParser.json());
pasteRouter.use(
    bodyParser.urlencoded({
        extended: false,
    })
);

/**
 * Middleware for the create paste route, check if the data provided matches the criteria and take the necessary steps after verification.
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
var postRequestMiddleware = async (req, res, next) => {
    if (req.body && req.body.data && req.body.data.length >= DATA.min) {
        // For the new paste creation/storage.
        let pasteData = {
            id: shortid.generate(),
            deleteKey: v1(),
            data: req.body.data,
            timestamp: dayjs().unix(),
            ip:
                req.headers['x-forwarded-for'] ||
                req.connection.remoteAddress ||
                'Unknown',
        };
        req.body.data = pasteData;
        next();
    } else {
        res.json({
            error: true,
            message:
                'Missing data or the data provided does not meet the criteria set by the administrator. +50 characters in length.',
        });
    }
};

/**
 * https://restfulapi.net/rest-put-vs-post/
 * Using POST as suggested.
 */
pasteRouter.post('*', postRequestMiddleware, async (req, res) => {
    if (
        (req.body &&
            req.body.data &&
            req.body.data.id &&
            req.body.data.timestamp,
        req.body.data.deleteKey,
        req.body.data.ip,
        req.body.data.data)
    ) {
        let pasteFilePath = `${__basedir}/${
            DIRECTORY.paste
        }/${req.body.data.id.substr(0, 2)}/${req.body.data.id}`;

        try {
            await fs.promises.mkdir(path.parse(pasteFilePath).dir, (err) => {
                if (err) {
                    res.json({
                        error: true,
                        message: 'Could not create directory.',
                    });
                }
            });

            await fs.promises.writeFile(
                pasteFilePath,
                JSON.stringify(req.body.data),
                (err) => {
                    if (err) {
                        res.json({
                            error: true,
                            message: 'Error storing the file in our storage.',
                        });
                    }
                }
            );

            await fs.stat(pasteFilePath, function (err, stat) {
                if (err == null) {
                    res.json({
                        error: false,
                        message:
                            'Successfully stored the paste in our storage.',
                        id: req.body.data.id,
                        link: `${DOMAIN}${req.body.data.id}`,
                        deleteKey: req.body.data.deleteKey,
                        deleteLink: `${DOMAIN}${req.body.data.id}/${req.body.data.deleteKey}`,
                        timestamp: req.body.data.timestamp,
                    });
                } else if (err.code == 'ENOENT') {
                    res.json({
                        error: true,
                        message:
                            'We were unable to store your data in our server at this time, feel free to contact the administrator or try again!',
                    });
                }
            });
        } catch (e) {
            console.log('Error: ', e);
        }
    }
});

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */

/**
 * Get request handling.
 */
var getRequestMiddelware = async (req, res, next) => {
    if (req.params && req.params.id && shortid.isValid(req.params.id)) {
        next();
    } else {
        res.sendFile(await `/views/index.txt`, { root: __basedir });
    }
};

pasteRouter.get('/', async (req, res) => {
    res.set({
        'Content-Type': 'text/plain',
        'Content-Disposition': `inline; filename="index"`,
        'Keep-Alive': 'timeout=5, max=1000',
    });
    res.sendFile(await `/views/index.todo`, { root: __basedir });
});

pasteRouter.get('/:id', getRequestMiddelware, async (req, res) => {
    if (req.params && req.params.id) {
        try {
            let pasteFilePath = `${__basedir}/${
                DIRECTORY.paste
            }/${req.params.id.substr(0, 2)}/${req.params.id}`;

            fs.stat(pasteFilePath, async (err, stat) => {
                if (err == null) {
                    // File exists, return the file contents.
                    await fs.readFile(pasteFilePath, (err, data) => {
                        if (err || !data) {
                            res.json({
                                error: true,
                                message:
                                    'We ran into an error while fetching the file with the id you provided.',
                            });
                        }
                        // No error, send the content.
                        let formattedData = JSON.parse(data);
                        if (formattedData && formattedData.data) {
                            let ts = dayjs(formattedData.timestamp * 1000);
                            res.set({
                                'Content-Type': 'text/plain',
                                'Content-Disposition': `inline; filename="${formattedData.id}.txt"`,
                                'Keep-Alive': 'timeout=5, max=1000',
                            });
                            res.type('txt');
                            res.status(200).send(
                                `${formattedData.data}${
                                    OUTPUT.data
                                        ? '\n\nCreated - ' + ts.fromNow()
                                        : ''
                                }`
                            );
                        }
                    });
                } else if (err.code === 'ENOENT') {
                    res.json({
                        error: true,
                        message: `Could not find the file associated with id (${req.params.id}).`,
                    });
                }
            });
        } catch (e) {
            console.log('ERROR: ', e);
        }
    }
});

pasteRouter.get('/:id/:deleteKey', async (req, res) => {
    if (
        req.params &&
        req.params.id &&
        req.params.deleteKey &&
        shortid.isValid(req.params.id) &&
        validate(req.params.deleteKey)
    ) {
        try {
            let pasteFilePath = `${__basedir}/${
                DIRECTORY.paste
            }/${req.params.id.substr(0, 2)}/${req.params.id}`;

            await fs.stat(pasteFilePath, async (err, stat) => {
                if (err == null) {
                    // File exists, let's check and validate.
                    await fs.readFile(pasteFilePath, async (err, data) => {
                        console.log('Reading file.');
                        if (err || !data) {
                            console.log('Error.');
                            res.json({
                                error: true,
                                message:
                                    'We ran into an error while fetching the file with the id you provided.',
                            });
                        }
                        // No error, send the content.
                        let formattedData = JSON.parse(data);
                        if (
                            formattedData &&
                            formattedData.data &&
                            formattedData.deleteKey &&
                            formattedData.id &&
                            formattedData.id === req.params.id &&
                            formattedData.deleteKey === req.params.deleteKey
                        ) {
                            await fs.unlink(pasteFilePath, (err) => {
                                if (err) throw err;
                                res.json({
                                    error: false,
                                    message: `Paste with id (${formattedData.id}) has been deleted!`,
                                });
                            });
                        }
                    });
                } else if (err.code === 'ENOENT') {
                    res.json({
                        error: true,
                        message: `Could not find the file associated with id (${req.params.id}).`,
                    });
                }
            });
        } catch (e) {
            throw e;
        }
    }
});

module.exports = pasteRouter;
