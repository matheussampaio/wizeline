import path from 'path';
import morgan from 'morgan';
import express from 'express';
import bodyParser from 'body-parser';
import errorHandler from 'errorhandler';
import methodOverride from 'method-override';

import Short from './routes/short';

const app = express();

app.set('port', process.env.PORT || 3000);
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(express.static(path.resolve('public')));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(methodOverride());
app.use(errorHandler());

app.post('/api/short', (req, res) => {
    Short.add({ url: req.body.url })
        .then(short => res.status(200).send({ short }))
        .catch(error => res.status(500).send({ error }));
});

app.get('/api/short', (req, res) => {
    Short.getAll()
        .then(urls => res.status(200).send({ urls }))
        .catch(error => res.status(500).send({ error }));
});

app.post('/api/custom', (req, res) => {
    Short.verifyShortUrl(req.body.custom)
        .then(customUrl => Short.add({ url: req.body.url, customUrl }))
        .then(short => res.status(200).send({ short }))
        .catch(error => res.status(error.status).send({ error }));
});

app.get('/:shorturl', (req, res) => {
    Short.get({ shortUrl: req.params.shorturl })
        .then((data) => {
            Short.inc({ shortUrl: req.params.shorturl });

            res.redirect(301, data.long_url);
        })
        .catch(error => res.status(404).send({
            error,
            status: 404,
            message: 'Page not found',
            hash: req.params.shorturl
        }));
});

app.all('/*', (req, res) => {
    // Just send the index.html for other files to support HTML5Mode
    res.sendFile(path.resolve('public/index.html'));
});

// app.get('/', (req, res) => {
//     res.sendFile(path.resolve('public/index.html'));
// });

app.listen(app.get('port'), () => {
    console.log(`Wizeshort listening on port ${app.get('port')}!`); // eslint-disable-line
});
