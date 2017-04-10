import crypto from 'crypto';
import validUrl from 'valid-url';

import client from '../database';
import utils from '../utils/utils';

class Shorten {
    constructor() {
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

    get({ shortenUrl, key, deleteToken = true }) {
        const shortenUrlKey = `shortenurl:${shortenUrl}`;

        // first, get the shorten url obj
        return client.hgetallAsync(key || shortenUrlKey).then((data) => {
            if (data == null) {
                return Promise.reject({ status: 404, code: 'SHORTEN_URL_NOT_FOUND', shortenUrl, key });
            }

            if (deleteToken) {
                delete data.token;
            }

            // then, get the long url
            return client.getAsync(data.long_url_md5).then((longUrl) => {
                data.long_url = longUrl;

                return data;
            });
        });
    }

    delete({ shortenUrl, token }) {
        const shortenUrlKey = `shortenurl:${shortenUrl}`;

        // first, get the shorten url obj
        return client.hgetallAsync(shortenUrlKey).then((data) => {
            if (data == null) {
                return Promise.reject({ status: 404, code: 'SHORTEN_URL_NOT_FOUND', url: shortenUrl });
            }

            if (data.token !== token) {
                return Promise.reject({ status: 404, code: 'INVALID_TOKEN', url: shortenUrl, token });
            }

            const promises = Promise.all([
                client.delAsync(shortenUrlKey),
                client.lremAsync('allshortenurls', 0, shortenUrlKey)
            ]);

            return promises.then(() => {
                data.deleted = true;

                return data;
            });
        });
    }

    add({ url, customUrl }) {
        if (url == null) {
            return Promise.reject({ status: 406, code: 'MISSING_URL_PARAM' });
        }

        const hasProtocol = /^(?:f|ht)tps?\:\/\//; // eslint-disable-line

        if (!hasProtocol.test(url)) {
            url = `http://${url}`;
        }

        const data = {};

        // check if this long url already exists in our database
        return this.getHash(url)
            .then((hash) => {
                data.md5Key = `md5:${hash}`;

                return client.existsAsync(data.md5Key);
            })
            .then((exists) => {
                // if not, just continue
                if (exists) {
                    return Promise.resolve();
                }

                return this.validadeUrl(url).then(() => {
                    // add this key to our index so we can fetch all md5 later
                    return Promise.all([
                        client.rpushAsync('allmd5', data.md5Key),
                        client.setAsync(data.md5Key, url)
                    ]);
                });
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

                return Promise.all([
                    // add this key to our index so we can fetch all shorten urls later
                    client.rpushAsync('allshortenurls', data.shortenUrlKey),

                    // add the shorten url with his initial data and fetch the data
                    client.hmsetAsync(data.shortenUrlKey,
                        'shorten_url', shortenUrl,
                        'long_url_md5', data.md5Key,
                        'clicks', 0,
                        'create_on', new Date().getTime(),
                        'token', utils.genToken()
                    )
                ]);
            })
            .then(() => {
                return this.get({
                    shortenUrl: data.shortenUrl,
                    deleteToken: false
                });
            });
    }

    validadeUrl(url) {
        return new Promise((resolve, reject) => {
            if (!validUrl.isWebUri(url)) {
                return reject({ status: 406, code: 'INVALID_URL' });
            }

            return resolve(url);

            // return request.head(url, (error) => {
            //
            //     if (error) {
            //         return reject({ status: 406, code: 'INVALID_URL' });
            //     }
            //
            //     return resolve(url);
            // });
        });
    }

    getUniqueShortenUrl() {
        const shortenUrl = utils.genToken(this.urlLength);

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
