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

server.get('/api/shorten', (req, res) => {
    Shorten.getAll()
        .then(urls => res.status(200).send({ urls }))
        .catch(error => res.status(500).send({ error }));
});

server.post('/api/shorten', (req, res) => {
    Shorten.add({ url: req.body.url })
        .then(shorten => res.status(200).send({ shorten }))
        .catch(error => res.status(error.status).send({ error }));
});

server.post('/api/custom', (req, res) => {
    Shorten.verifyShortenUrl(req.body.custom)
        .then(customUrl => Shorten.add({ url: req.body.url, customUrl }))
        .then(shorten => res.status(200).send({ shorten }))
        .catch(error => res.status(error.status).send({ error }));
});

server.all('/urls', (req, res) => {
    // Just send the index.html for other files to support HTML5Mode
    res.sendFile(path.resolve('public/index.html'));
});

server.get('/:shortenurl', (req, res) => {
    Shorten.get({ shortenUrl: req.params.shortenurl })
        .then((data) => {
            Shorten.inc({ shortenUrl: req.params.shortenurl });

            res.redirect(301, data.long_url);
        })
        .catch(error => res.status(404).send({
            error,
            status: 404,
            message: 'Page not found',
            shorten_url: req.params.shortenurl
        }));
});

server.all('/*', (req, res) => {
    // Just send the index.html for other files to support HTML5Mode
    res.sendFile(path.resolve('public/index.html'));
});

server.listen(server.get('port'), () => {
    console.log(`Wizeshort listening on port ${server.get('port')}!`); // eslint-disable-line
});

export default server;
