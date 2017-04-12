import path from 'path';
import morgan from 'morgan';
import express from 'express';
import bodyParser from 'body-parser';
import errorHandler from 'errorhandler';
import methodOverride from 'method-override';

import Shorten from './routes/shorten';

const server = express();

server.set('port', process.env.PORT || 3000);

if (process.env.NODE_ENV !== 'test') {
    server.use(morgan('dev'));
}

server.use(bodyParser.json());
server.use(express.static(path.resolve('public')));
server.use(bodyParser.urlencoded({
    extended: true
}));
server.use(methodOverride());
server.use(errorHandler());

server.get('/api/top', (req, res) => {
    Shorten.getTopHostnames()
        .then(top => res.status(200).send({ top }))
        .catch(error => res.status(500).send({ error }));
});

server.get('/api/shorten/:url', (req, res) => {
    Shorten.get({ shortenUrl: req.params.url })
        .then(shorten => res.status(200).send(shorten))
        .catch(error => res.status(500).send({ error }));
});

server.delete('/api/shorten/:url', (req, res) => {
    Shorten.delete({ shortenUrl: req.params.url, token: req.query.token })
        .then(shorten => res.status(200).send(shorten))
        .catch(error => res.status(500).send({ error }));
});

server.get('/api/shorten', (req, res) => {
    Shorten.getAll(req.query)
        .then(data => res.status(200).send(data))
        .catch(error => res.status(500).send({ error }));
});

server.post('/api/shorten', (req, res) => {
    Shorten.add({ url: req.body.url })
        .then(shorten => res.status(200).send({ shorten }))
        .catch(error => res.status(error.status).send({ error }));
});

server.post('/api/custom', (req, res) => {
    Shorten.verifyShortenUrl(req.body.custom)
        .then(() => {
            if (req.body.deleteOld) {
                return Shorten.delete({ shortenUrl: req.body.shortenUrl, token: req.body.token });
            }

            return Promise.resolve();
        })
        .then(() => Shorten.add({ url: req.body.url, customUrl: req.body.custom }))
        .then(shorten => res.status(200).send({ shorten }))
        .catch(error => res.status(error.status).send({ error }));
});

server.all('/top', (req, res) => {
    // Just send the index.html for other files to support HTML5Mode
    res.sendFile(path.resolve('public/index.html'));
});

server.all('/urls', (req, res) => {
    // Just send the index.html for other files to support HTML5Mode
    res.sendFile(path.resolve('public/index.html'));
});

server.all('/404', (req, res) => {
    // Just send the index.html for other files to support HTML5Mode
    res.sendFile(path.resolve('public/index.html'));
});

server.get('/:shortenurl', (req, res) => {
    Shorten.get({ shortenUrl: req.params.shortenurl })
        .then((data) => {
            Shorten.inc({ shortenUrl: req.params.shortenurl });

            res.redirect(301, data.long_url);
        })
        .catch(() => {
            res.redirect('/404');
        });
});

server.all('/*', (req, res) => {
    // Just send the index.html for other files to support HTML5Mode
    res.sendFile(path.resolve('public/index.html'));
});

server.listen(server.get('port'), () => {
    console.log(`Wizeshort listening on port ${server.get('port')}!`); // eslint-disable-line
});

export default server;
