// import http from 'http';
// import path from 'path';
import morgan from 'morgan';
import express from 'express';
import bodyParser from 'body-parser';
import errorHandler from 'errorhandler';
import methodOverride from 'method-override';

// import logger from './utils/logger';
import Short from './routes/short';

const app = express();

app.set('port', process.env.PORT || 3000);
app.use(morgan('dev'));
// app.use(express.static(path.resolve('www')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(methodOverride());

app.get('/', (req, res) => {
    res.status(200).send('Hello World!');
});

app.post('/api/short', (req, res) => {
    const data = Short.add({ url: req.body.url });

    return res.status(200).send({ data });
});

app.get('/api/short', (req, res) => {
    return res.status(200).send({ urls: Short.urls });
});

app.get('/:hash', (req, res) => {
    const data = Short.get({ hash: req.params.hash });

    if (data == null) {
        return res.status(404).send({ status: 404, error: 'Page not found' });
    }

    Short.inc({ hash: data.hash });

    return res.redirect(301, data.long_url);
});

app.listen(3000, () => {
    console.log('Example app listening on port 3000!');
})
