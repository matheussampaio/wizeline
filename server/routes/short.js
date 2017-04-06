import crypto from 'crypto';

class Short {
    constructor() {
        this.urls = {};
    }

    get({ hash }) {
        console.log('Short::get', { hash });
        return this.urls[hash];
    }

    add({ hash, url }) {
        console.log('Short::add', { url, hash });

        if (url == null) {
            throw new Error('MISSING_URL_PARAM');
        }

        if (hash == null) {
            hash = this.getHash({ url });
        }

        if (this.urls[hash] == null) {
            this.urls[hash] = {
                hash,
                long_url: url,
                clicks: 0,
                created_on: new Date().getTime()
            };
        }

        return this.urls[hash];
    }

    has({ hash }) {
        console.log('Short::has', { hash });

        return this.urls[hash] != null;
    }

    getHash({ url }) {
        console.log('Short::getHash', { url });

        if (url == null) {
            throw new Error('MISSING_URL_PARAM');
        }

        return crypto.createHash('md5').update(url).digest('hex').toString();
    }

    inc({ hash }) {
        console.log('Short::inc', { hash });

        if (hash != null && this.urls[hash] != null) {
            this.urls[hash].clicks += 1;
        }
    }
}

const singleton = new Short();


export default singleton;
