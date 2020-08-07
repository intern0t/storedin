const request = require('supertest');

let pasteDetails = {
    id: '',
    deleteKey: '',
    data: '',
    timestamp: '',
};

describe('POST Endpoints', () => {
    it('Returns 400 error and message if POST request contains less than 50 characters.', async () => {
        const res = await request('localhost:9999').post('/').send({
            data: 'test is cool',
        });
        // console.log(typeof res.body);
        expect(res.statusCode).toEqual(400);
        expect(typeof res.body).toEqual('object');
        expect(res.body.error).toBe(true);
    });

    it('Returns 201 success if POST request contains more than/equal to 50 characters and have specific fields.', async () => {
        const res = await request('localhost:9999').post('/').send({
            data:
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut pretium justo lectus, at vestibulum purus varius nec. Nunc eget sem sit amet justo malesuada vehicula ut id quam. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. In eu mi porta, porta lectus quis, sollicitudin mi. Vestibulum gravida, urna sit amet suscipit iaculis, lorem nibh pretium diam, non maximus felis nibh eget elit. Maecenas ac urna erat. Aliquam posuere interdum sodales.',
        });
        expect(res.statusCode).toEqual(201);
        expect(typeof res.body).toEqual('object');
        expect(res.body.error).toBeFalsy();
        expect(res.body.id.length).toBeGreaterThanOrEqual(0);
        expect(res.body.deleteKey.length).toBeGreaterThanOrEqual(0);
        expect(res.body.timestamp).toBeGreaterThanOrEqual(1000);
        expect(res.body.deleteKey.length).toBeGreaterThanOrEqual(0);
        expect(res.body.link).toContain(res.body.id);

        pasteDetails.id = res.body.id;
        pasteDetails.deleteKey = res.body.deleteKey;
        pasteDetails.data = res.body.data;
        pasteDetails.timestamp = res.body.timestamp;
    });

    it('Returns 400 Bad Request error if the content is missing or not provided by the user.', async () => {
        const res = await request('localhost:9999').post('/').send();
        // console.log(typeof res.body);
        expect(res.statusCode).toEqual(400);
        expect(typeof res.body).toEqual('object');
        expect(res.body.error).toBe(true);
        expect(res.body.message).toContain('Missing');
    });
});

describe('GET Endpoints', () => {
    it('Returns slab of text for GET request to the root domain /.', async () => {
        const res = await request('localhost:9999').get('/');
        // console.log(res.text);
        expect(res.statusCode).toEqual(200);
        expect(typeof res.text).toEqual('string');
        expect(res.text).toContain('✔');
    });

    it('Fetches the paste when id is provided as URL parameter. /id ', async () => {
        const res = await request('localhost:9999').get(`/${pasteDetails.id}`);
        expect(res.statusCode).toEqual(200);
        expect(typeof res.text).toEqual('string');
        expect(res.text.length).toBeGreaterThanOrEqual(50);
        expect(res.header['cache-control']).toEqual('public, max-age=2592000');
    });

    it('Deletes the paste when deleteKey is provided in format of /id/deleteKey ', async () => {
        const res = await request('localhost:9999').get(
            `/${pasteDetails.id}/${pasteDetails.deleteKey}`
        );
        expect(res.statusCode).toEqual(200);
        expect(typeof res.body).toEqual('object');
        expect(res.body.error).toBeFalsy();
    });
});
