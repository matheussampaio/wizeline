import crypto from 'crypto';

import client from '../database';

class Shorten {
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
        return client.llenAsync('allshortenurls')
            .then(length => client.lrangeAsync('allshortenurls', 0, length))
            .then((allShortensUrl) => {
                const promises = allShortensUrl.map(shortenUrl => this.get({ key: shortenUrl }));

                return Promise.all(promises);
            });
    }

    get({ shortenUrl, key }) {
        const shortenUrlKey = `shortenurl:${shortenUrl}`;

        // first, get the shorten url obj
        return client.hgetallAsync(key || shortenUrlKey).then((data) => {
            if (data == null) {
                return Promise.reject({ status: 404, code: 'SHORTEN_URL_NOT_FOUND', url: shortenUrl });
            }

            // then, get the long url
            return client.getAsync(data.long_url_md5).then((longUrl) => {
                data.long_url = longUrl;

                return data;
            });
        });
    }

    add({ url, customUrl }) {
        if (url == null) {
            return Promise.reject({ status: 406, code: 'MISSING_URL_PARAM' });
        }

        const data = {};

        // check if this long url already exists in our database
        return this.getHash(url)
            .then((hash) => {
                data.hash = hash;
                data.md5Key = `md5:${hash}`;

                return client.existsAsync(data.md5Key);
            })
            .then((exists) => {
                data.exists = exists;

                // if not, just continue
                if (exists) {
                    return Promise.resolve();
                }

                // add this key to our index so we can fetch all md5 later
                client.rpushAsync('allmd5', data.md5Key)
                    .catch(error => console.error(error));

                return client.setAsync(data.md5Key, url);
            })
            // generate an unique shorten url or use a custom one
            .then(() => {
                if (customUrl != null) {
                    return customUrl;
                }

                return this.getUniqueShortenUrl();
            })
            // add the new shorten url to the database
            .then((shortenUrl) => {
                data.shortenUrl = shortenUrl;
                data.shortenUrlKey = `shortenurl:${shortenUrl}`;

                // add this key to our index so we can fetch all shorten urls later
                client.rpushAsync('allshortenurls', data.shortenUrlKey)
                    .catch(error => console.error(error));

                // add the shorten url with his initial data and fetch the data
                return client.hmsetAsync(data.shortenUrlKey,
                    'shorten_url', shortenUrl,
                    'long_url_md5', data.md5Key,
                    'clicks', 0,
                    'create_on', new Date().getTime()
                );
            })
            .then(() => {
                return this.get({
                    shortenUrl: data.shortenUrl
                });
            });
    }

    getUniqueShortenUrl() {
        let shortenUrl = '';

        // generate a random shorten url
        for (let i = 0; i < this.urlLength; i++) {
            const index = parseInt(Math.random() * this.alphabet.length, 10);

            shortenUrl += this.alphabet[index];
        }

        // verify if that shorten url is unique, if not try again
        return this.verifyShortenUrl(shortenUrl).catch(() => this.getUniqueShortenUrl());
    }

    verifyShortenUrl(shortenUrl) {
        if (shortenUrl == null) {
            return Promise.reject({ status: 406, code: 'MISSING_CUSTOM_PARAM' });
        }

        const shortenUrlKey = `shortenurl:${shortenUrl}`;

        // check if that shorten url key already exists
        return client.existsAsync(shortenUrlKey).then((exists) => {
            // if exists, reject
            if (exists) {
                return Promise.reject({ status: 406, code: 'CUSTOM_URL_TAKEN' });
            }

            // otherwise, resolve
            return Promise.resolve(shortenUrl);
        });
    }

    getHash(url) {
        if (url == null) {
            return Promise.reject({ status: 406, code: 'MISSING_URL_PARAM' });
        }

        const md5 = crypto.createHash('md5').update(url, 'ascii').digest('hex').toString();

        return Promise.resolve(md5);
    }

    inc({ shortenUrl }) {
        const shortenUrlKey = `shortenurl:${shortenUrl}`;
        const field = 'clicks';

        return client.hincrbyAsync(shortenUrlKey, field, 1);
    }
}

const singleton = new Shorten();

export default singleton;
