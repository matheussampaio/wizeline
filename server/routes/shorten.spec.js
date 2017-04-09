import chai from 'chai';
import chaiHttp from 'chai-http';

import server from '../server';

chai.use(chaiHttp);

const expect = chai.expect;

describe('GET: /api/shorten', () => {
    it('should return an array of urls', (done) => {
        chai.request(server)
            .get('/api/shorten')
            .end((err, res) => {
                expect(res.body.urls).to.not.equal(null);

                done();
            });
    });
});

describe('POST: /api/shorten', () => {
    const data = {
        url: 'http://www.example.com'
    };

    it('should shorten an url', (done) => {
        chai.request(server)
            .post('/api/shorten')
            .send({
                url: data.url
            })
            .end((err, res) => {
                expect(err).to.equal(null);
                expect(res.status).to.equal(200);
                expect(res.type).to.equal('application/json');

                const shorten = res.body.shorten;

                data.shorten = shorten.shorten_url;

                expect(shorten.long_url).to.equal(data.url);
                expect(shorten.clicks).to.equal('0');

                done();
            });
    });

    it('should return an error if we don\'t send the url', (done) => {
        chai.request(server)
            .post('/api/shorten')
            .send({})
            .end((err, res) => {
                expect(err).to.not.equal(null);
                expect(res.status).to.equal(406);
                expect(res.type).to.equal('application/json');

                expect(res.body.error).to.not.equal(null);
                expect(res.body.error.code).to.equal('MISSING_URL_PARAM');

                done();
            });
    });
});

describe('POST: /api/custom', () => {
    const data = {
        custom: 'wizeshort',
        url: 'http://www.example.com'
    };

    it('should shorten the url with a custom url', (done) => {
        chai.request(server)
            .post('/api/custom')
            .send({
                url: data.url,
                custom: data.custom
            })
            .end((err, res) => {
                expect(err).to.equal(null);
                expect(res.status).to.equal(200);
                expect(res.type).to.equal('application/json');

                const shorten = res.body.shorten;

                data.shorten = shorten.shorten_url;

                expect(shorten.long_url).to.equal(data.url);
                expect(shorten.shorten_url).to.equal(data.custom);
                expect(shorten.clicks).to.equal('0');

                done();
            });
    });

    it('should return an error if it\s a duplicate', (done) => {
        data.custom = new Date().getTime().toString();

        chai.request(server)
            .post('/api/custom')
            .send({
                url: data.url,
                custom: data.custom
            })
            .end((err, res) => {
                expect(err).to.equal(null);
                expect(res.status).to.equal(200);
                expect(res.type).to.equal('application/json');

                const shorten = res.body.shorten;

                data.shorten = shorten.shorten_url;

                expect(shorten.long_url).to.equal(data.url);
                expect(shorten.shorten_url).to.equal(data.custom);
                expect(shorten.clicks).to.equal('0');

                chai.request(server)
                    .post('/api/custom')
                    .send({
                        url: data.url,
                        custom: data.custom
                    })
                    .end((err, res) => {
                        expect(err).to.not.equal(null);
                        expect(res.status).to.equal(406);
                        expect(res.type).to.equal('application/json');

                        expect(res.body.error).to.not.equal(null);
                        expect(res.body.error.code).to.equal('CUSTOM_URL_TAKEN');

                        done();
                    });
            });
    });

    it('should return an error if we don\'t send the url', (done) => {
        data.custom = new Date().getTime().toString();

        chai.request(server)
            .post('/api/custom')
            .send({
                custom: data.custom
            })
            .end((err, res) => {
                expect(err).to.not.equal(null);
                expect(res.status).to.equal(406);
                expect(res.type).to.equal('application/json');

                expect(res.body.error).to.not.equal(null);
                expect(res.body.error.code).to.equal('MISSING_URL_PARAM');

                done();
            });
    });

    it('should return an error if we don\'t send the custom url', (done) => {
        chai.request(server)
            .post('/api/custom')
            .send({
                url: data.url
            })
            .end((err, res) => {
                expect(err).to.not.equal(null);
                expect(res.status).to.equal(406);
                expect(res.type).to.equal('application/json');

                expect(res.body.error).to.not.equal(null);
                expect(res.body.error.code).to.equal('MISSING_CUSTOM_PARAM');

                done();
            });
    });
});

describe('GET: /:shortenurl', () => {
    const data = {
        custom: new Date().getTime().toString(),
        url: 'http://www.example.com/'
    };

    it('should return an error if the url doesn\t exists', (done) => {
        chai.request(server)
            .get(`/${data.custom}`)
            .end((err, res) => {
                expect(err).to.not.equal(null);
                expect(res.status).to.equal(404);
                expect(res.type).to.equal('application/json');

                expect(res.body.shorten_url).to.equal(data.custom);

                done();
            });
    });

    it('should redirect to the long_url if exists', (done) => {
        chai.request(server)
            .post('/api/custom')
            .send({
                url: data.url,
                custom: data.custom
            })
            .end((err, res) => {
                chai.request(server)
                    .get(`/${res.body.shorten.shorten_url}`)
                    .end((err, res) => {
                        expect(err).to.equal(null);
                        expect(res.status).to.equal(200);

                        expect(res.redirects[0]).to.equal(data.url);

                        done();
                    });
            });
    }).timeout(10000);
});
