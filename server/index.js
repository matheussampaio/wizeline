// import http from 'http';
// import path from 'path';
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
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(methodOverride());
app.use(errorHandler());

app.get('/', (req, res) => {
    res.status(200).send('Hello World!');
});

app.post('/api/short', (req, res) => {
    return Short.add({ url: req.body.url })
        .then(short => res.status(200).send({ short }))
        .catch(error => res.status(500).send({ error }));
});

app.get('/api/short', (req, res) => {
    return Short.getAll()
        .then(urls => res.status(200).send({ urls }))
        .catch(error => res.status(500).send({ error }));
});

app.get('/:hash', (req, res) => {
    return Short.get({ hash: req.params.hash })
        .then(data => {
            Short.inc({ hash: req.params.hash });

            return res.redirect(301, data.long_url);
        })
        .catch(error => res.status(404).send({
            error,
            status: 404,
            message: 'Page not found',
            hash: req.params.hash
        }));
});

app.listen(app.get('port'), () => {
    console.log(`Wizeshort listening on port ${app.get('port')}!`);
})
