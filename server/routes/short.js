import crypto from 'crypto';

import client from '../database';

class Short {
    getAll() {
        return client.llenAsync('hashs')
            .then(length => client.lrangeAsync('hashs', 0, length))
            .then((hashs) => {
                const promises = hashs.map(hash => client.hgetallAsync(hash));

                return Promise.all(promises);
            });
    }

    get({ hash }) {
        return client.hgetallAsync(`short:${hash}`);
    }

    add({ url }) {
        if (url == null) {
            throw new Error('MISSING_URL_PARAM');
        }

        const hash = this.getHash({ url });
        const key = `short:${hash}`;
        let isNew = false;

        return client.existsAsync(key)
            .then((exists) => {
                if (exists) {
                    return Promise.resolve();
                }

                isNew = true;

                client.rpushAsync('hashs', `short:${hash}`);

                return client.hmsetAsync(`short:${hash}`, 'hash', hash, 'long_url', url, 'clicks', 0, 'create_on', new Date().getTime());
            })
            .then(() => this.get({ hash }))
            .then((data) => {
                data.new = isNew;

                return data;
            });
    }

    getHash({ url }) {
        if (url == null) {
            throw new Error('MISSING_URL_PARAM');
        }

        return crypto.createHash('md5').update(url).digest('hex').toString();
    }

    inc({ hash }) {
        const key = `short:${hash}`;
        const field = 'clicks';

        return client.hincrbyAsync(key, field, 1);
    }
}

const singleton = new Short();

export default singleton;
