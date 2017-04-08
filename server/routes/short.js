import crypto from 'crypto';

import client from '../database';

class Short {
    constructor() {
        this.alphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

        // number of urls we can store with X chars
        //
        // alphabet.length ** X:
        // 13.537.086.546.263.552 === 9
        //    218.340.105.584.896 === 8
        //      3.521.614.606.208 === 7
        //         56.800.235.584 === 6
        //            916.132.832 === 5
        //             14.776.336 === 4
        this.urlLength = 7;
    }

    getAll() {
        return client.llenAsync('allshortsurls')
            .then(length => client.lrangeAsync('allshortsurls', 0, length))
            .then((allShortsUrl) => {
                const promises = allShortsUrl.map(shortUrl => client.hgetallAsync(shortUrl));

                return Promise.all(promises);
            });
    }

    get({ shortUrl }) {
        const shortUrlKey = `shorturl:${shortUrl}`;

        // first, get the short url obj
        return client.hgetallAsync(shortUrlKey).then((data) => {

            // then, get the long url
            return client.getAsync(data.long_url_md5).then((longUrl) => {
                data.long_url = longUrl;

                return data;
            });
        });
    }

    add({ url, customUrl }) {
        if (url == null) {
            throw new Error('MISSING_URL_PARAM');
        }

        const hash = this.getHash(url);
        const md5Key = `md5:${hash}`;

        // check if this long url already exists in our database
        return client.existsAsync(md5Key)
            .then((exists) => {
                // if not, just continue
                if (exists) {
                    return Promise.resolve();
                }

                // add this key to our index so we can fetch all md5 later
                client.rpushAsync('allmd5', md5Key);

                return client.setAsync(md5Key, url);
            })
            // generate an unique short url or use a custom one
            .then(() => {
                if (customUrl != null) {
                    return customUrl;
                }

                return this.getUniqueShortUrl();
            })
            // add the new short url to the database
            .then((shortUrl) => {
                const shortUrlKey = `shorturl:${shortUrl}`;

                // add this key to our index so we can fetch all short urls later
                client.rpushAsync('allshortsurls', shortUrlKey);

                // add the short url with his initial data and fetch the data
                return client.hmsetAsync(shortUrlKey,
                    'short_url', shortUrl,
                    'long_url_md5', md5Key,
                    'clicks', 0,
                    'create_on', new Date().getTime()
                )
                .then(() => this.get({ shortUrl }));
            });
    }

    getUniqueShortUrl() {
        let shortUrl = '';

        // generate a random short url
        for (let i = 0; i < this.urlLength; i++) {
            const index = parseInt(Math.random() * this.alphabet.length, 10);

            shortUrl += this.alphabet[index];
        }

        // verify if that short url is unique, if not try again
        return this.verifyShortUrl(shortUrl).catch(() => this.getUniqueShortUrl());
    }

    verifyShortUrl(shortUrl) {
        const shortUrlKey = `shorturl:${shortUrl}`;

        // check if that short url key already exists
        return client.existsAsync(shortUrlKey).then((exists) => {
            // if exists, reject
            if (exists) {
                return Promise.reject({ status: 400, code: 'CUSTOM_URL_TAKEN' });
            }

            // otherwise, resolve
            return Promise.resolve(shortUrl);
        });
    }

    getHash(url) {
        if (url == null) {
            throw new Error('MISSING_URL_PARAM');
        }

        return crypto.createHash('md5').update(url, 'ascii').digest('hex').toString();
    }

    inc({ shortUrl }) {
        const shortUrlKey = `shorturl:${shortUrl}`;
        const field = 'clicks';

        return client.hincrbyAsync(shortUrlKey, field, 1);
    }
}

const singleton = new Short();

export default singleton;
