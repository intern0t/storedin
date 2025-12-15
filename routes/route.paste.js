/**
 * Copyright © StoredIn, 2020
 * Developer: Prashant Shrestha (www.prashant.me)
 * Date: Wed 05 Aug 2020 01:07:43 PM EDT
 * Document: route.paste.js (Entry)
 * Licensed: MIT (Open Source)
 */

const pasteRouter = require('express-promise-router')();
const bodyParser = require('body-parser');
const compression = require('compression');
const { v1, validate } = require('uuid');
const path = require('path');
const fs = require('fs');
const dayjs = require('dayjs');
var relativeTime = require('dayjs/plugin/relativeTime');
const rateLimit = require('express-rate-limit');
var crypto = require('crypto');
const {
    DATA,
    DIRECTORY,
    DOMAIN,
    OUTPUT,
    LIMIT,
    DEV,
    PORT,
} = require('../config');

// Setting up default rate limit options (150 paste views/15 min)
const viewPasteRateLimit = rateLimit({
    windowMs: LIMIT.timeInMs,
    max: LIMIT.view,
    message:
        'You have exceeded the limit set by the API to view the paste per 15 minute, please slow down.',
    headers: true,
});

// Default rate limit for creating a paste, 50 paste creation/15 min. window.
const createPasteRateLimit = rateLimit({
    windowMs: LIMIT.timeInMs,
    max: LIMIT.create,
    message:
        'You have exceeded the limit set by the API to create paste per 15 minute, please slow down.',
    headers: true,
});

// In order to accept POST requests.
pasteRouter.use(
    bodyParser.json({
        limit: DATA.maxPayloadSize,
    })
);
pasteRouter.use(
    bodyParser.urlencoded({ limit: DATA.maxPayloadSize, extended: true })
);

// Compress every requests & responses.
pasteRouter.use(compression());

// Setting up daysjs
OUTPUT.data ? dayjs.extend(relativeTime) : null;

pasteRouter.get('/favicon.ico', function (req, res) {
    res.statusCode = 200;
    // res.setHeader('Content-Length', favicon.length);
    res.setHeader('Content-Type', 'image/x-icon');
    res.setHeader('Cache-Control', 'public, max-age=2592000');
    res.setHeader('Expires', new Date(Date.now() + 2592000000).toUTCString());
    res.sendFile(__basedir + '/views/favicon.ico');
});

const trimId = (id, length) => {
    return id.length > length ? id.substring(0, length) : id;
};

/**
 * Middleware for the create paste route, check if the data provided matches the criteria and take the necessary steps after verification.
 */
var postRequestMiddleware = async (req, res, next) => {
    if (req.body && req.body.data && req.body.data.length >= DATA.min) {
        // For the new paste creation/storage.
        let md5 = crypto.createHash('md5').update(req.body.data).digest('hex');

        let pasteData = {
            id:
                OUTPUT.paste_id_length > 0
                    ? trimId(md5, OUTPUT.paste_id_length)
                    : md5,
            md5: md5,
            timestamp: dayjs().unix(),
            ip:
                req.headers['Cf-Pseudo-IPv4'] ||
                req.headers['x-forwarded-for'] ||
                req.connection.remoteAddress ||
                'Unknown',
            deleteKey: v1(),
            data: req.body.data,
        };
        req.body.data = pasteData;
        next();
    } else {
        // 400 Bad Request
        res.status(400).json({
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
pasteRouter.post(
    '*',
    [postRequestMiddleware, createPasteRateLimit],
    async (req, res) => {
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

            fs.promises
                .stat(pasteFilePath)
                .then(async () => {
                    // File exists, return the file contents.
                    const data = await fs.promises.readFile(pasteFilePath);
                    const formattedData = JSON.parse(data);
                    let _domain = DEV ? `http://localhost:${PORT}/` : DOMAIN;
                    DOMAIN;

                    console.log(`_domain if exists: ${DOMAIN}`, DEV, PORT);

                    res.status(200).json({
                        error: false,
                        message:
                            'Paste already exists, returning existing data.',
                        id: formattedData.id,
                        link: `${_domain}${formattedData.id}`,
                        deleteKey: formattedData.deleteKey,
                        deleteLink: `${_domain}${formattedData.id}/${formattedData.deleteKey}`,
                        timestamp: formattedData.timestamp,
                    });
                })
                .catch((err) => {
                    if (err.code === 'ENOENT') {
                        // File does not exist, create it.
                        return fs.promises
                            .mkdir(path.parse(pasteFilePath).dir, {
                                recursive: true,
                            })
                            .then(() => {
                                return fs.promises.writeFile(
                                    pasteFilePath,
                                    JSON.stringify(req.body.data)
                                );
                            })
                            .then(() => {
                                return fs.promises.stat(pasteFilePath);
                            })
                            .then((stat) => {
                                let _domain = DEV
                                    ? `http://localhost:${PORT}/`
                                    : DOMAIN;

                                console.log(
                                    `_domain after creation: ${_domain}`
                                );

                                // 201 Created
                                res.status(201).json({
                                    error: false,
                                    message:
                                        'Successfully stored the paste in our storage.',
                                    id: req.body.data.id,
                                    link: `${_domain}${req.body.data.id}`,
                                    deleteKey: req.body.data.deleteKey,
                                    deleteLink: `${_domain}${req.body.data.id}/${req.body.data.deleteKey}`,
                                    timestamp: req.body.data.timestamp,
                                });
                            });
                    } else {
                        throw err;
                    }
                })
                .catch((err) => {
                    console.log('Error: ', err);
                    if (err.code === 'ENOENT') {
                        res.status(507).json({
                            error: true,
                            message:
                                'We were unable to store your data in our server at this time, feel free to contact the administrator or try again!',
                        });
                    } else {
                        res.status(500).json({
                            error: true,
                            message:
                                'Server ran into an error when trying to create a paste with your data.',
                        });
                    }
                });
        } else {
            // 400 Bad Request
            res.status(400).json({
                error: true,
                message:
                    'Missing the required parameters, please provide the content in data parameter.',
            });
        }
    }
);

/**
 * Generates an ETag based ONLY on file metadata (size + modification time).
 */
async function getFileMetaETag(pasteId) {
    try {
        const fabricated_path = `${__basedir}/${
            DIRECTORY.paste
        }/${pasteId.substr(0, 2)}/${pasteId}`;

        // Uses fs.promises to be non-blocking
        const stats = await fs.promises.stat(fabricated_path);

        const size = stats.size;
        const mtime = stats.mtimeMs;
        const dataString = `${pasteId}-${size}-${mtime}`;

        return crypto.createHash('md5').update(dataString).digest('hex');
    } catch (err) {
        if (err.code === 'ENOENT') return null;
        throw err;
    }
}

/**
 * Middleware for GET request.
 * RESPONSIBILITY: Handle caching (304) and set ETag headers.
 */
var getRequestMiddleware = async (req, res, next) => {
    if (
        req.params &&
        req.params.id &&
        req.params.id.match(/^[a-zA-Z0-9_-]+$/)
    ) {
        // 1. Calculate ETag
        const latestETag = await getFileMetaETag(req.params.id);

        if (latestETag) {
            // 2. Set the header for the *upcoming* response
            res.setHeader('ETag', latestETag);

            // 3. Check if client has this version
            if (req.headers['if-none-match'] === latestETag) {
                // STOP HERE: Client has the file.
                return res.status(304).end();
            }
        }
        // 4. Client needs the file, proceed to route handler
        next();
    } else {
        // Serve index if ID is invalid/missing
        res.status(200).sendFile('/views/index.html', {
            root: __basedir,
        });
    }
};

pasteRouter.get('/', async (req, res) => {
    res.set({
        'Content-Disposition': `inline; filename="index"`,
        'Keep-Alive': 'timeout=5, max=1000',
        'Cache-Control': 'public, max-age=3600',
    });
    res.status(200).sendFile('/views/index.html', { root: __basedir });
});

/**
 * RESPONSIBILITY: Read file and send content.
 * (Caching is already handled by middleware)
 */
pasteRouter.get(
    '/:id',
    [getRequestMiddleware, viewPasteRateLimit],
    async (req, res) => {
        if (req.params && req.params.id) {
            try {
                let pasteFilePath = `${__basedir}/${
                    DIRECTORY.paste
                }/${req.params.id.substr(0, 2)}/${req.params.id}`;

                // Note: You can switch this to fs.promises.readFile for consistency if desired
                fs.readFile(pasteFilePath, (err, data) => {
                    if (err || !data) {
                        return res.status(404).json({
                            error: true,
                            message:
                                'The file with the id you provided does not exist in our storage.',
                        });
                    }

                    // Parse Data
                    let formattedData = JSON.parse(data);

                    if (formattedData && formattedData.data) {
                        let ts = dayjs(formattedData.timestamp * 1000);

                        res.set({
                            'Content-Type': 'text/plain',
                            'Content-Disposition': `inline; filename="${formattedData.id}.txt"`,
                            'Keep-Alive': 'timeout=5, max=1000',
                            'Cache-Control': 'no-cache', // Important: Force revalidation (check ETag)
                        });
                        // ETag header is ALREADY SET by getRequestMiddleware

                        res.status(200).send(
                            `${formattedData.data}${
                                OUTPUT.data
                                    ? '\n\nCreated - ' + ts.fromNow()
                                    : ''
                            }`
                        );
                    }
                });
            } catch (e) {
                console.log('ERROR: ', e);
                // 500 Internal Server Error
                res.status(500).json({
                    error: true,
                    message: `Server ran into an error when trying to retrieve a paste with id (${req.params.id}).`,
                });
            }
        } else {
            res.status(400).json({
                error: true,
                message: 'Missing paste id.',
            });
        }
    }
);

pasteRouter.get('/:id/:deleteKey', createPasteRateLimit, async (req, res) => {
    if (
        req.params &&
        req.params.id &&
        req.params.deleteKey &&
        req.params.id.match(/^[a-zA-Z0-9_-]+$/) &&
        validate(req.params.deleteKey)
    ) {
        try {
            let pasteFilePath = `${__basedir}/${
                DIRECTORY.paste
            }/${req.params.id.substr(0, 2)}/${req.params.id}`;

            fs.stat(pasteFilePath, async (err, stat) => {
                if (err == null) {
                    fs.readFile(pasteFilePath, async (err, data) => {
                        if (err || !data) {
                            res.status(404).json({
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
                            // Delete the paste file first.
                            await fs.unlink(pasteFilePath, async (err) => {
                                if (err) {
                                    res.status(500).json({
                                        error: true,
                                        message: `Server encountered a problem when trying to delete the paste file.`,
                                    });
                                    throw err;
                                }

                                // Try and delete the directory
                                await fs.rmdir(
                                    path.dirname(pasteFilePath),
                                    (err) => {
                                        if (err && err.code !== 'ENOTEMPTY') {
                                            console.log(err);
                                        }
                                        res.status(200).json({
                                            error: false,
                                            message: `Paste with id (${formattedData.id}) has been deleted!`,
                                        });
                                    }
                                );
                            });
                        } else {
                            // 401 Unauthorized
                            res.status(401).json({
                                error: true,
                                message: `You do not have the permission to delete this paste.`,
                            });
                        }
                    });
                } else if (err.code === 'ENOENT') {
                    res.status(404).json({
                        error: true,
                        message: `Could not find the file associated with id (${req.params.id}).`,
                    });
                }
            });
        } catch (e) {
            console.log('Error:', e);
            // 500 Internal Server Error
            res.status(500).json({
                error: true,
                message: `Server ran into an error when trying to delete a paste.`,
            });
        }
    } else {
        res.status(400).json({
            error: true,
            message: `Invalid ID or Delete Key.`,
        });
    }
});

module.exports = pasteRouter;