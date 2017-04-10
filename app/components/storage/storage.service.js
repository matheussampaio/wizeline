class StorageService {
    /* @ngInject */
    constructor($log, $localStorage, WireshortDebug) {
        if (WireshortDebug) {
            window.mStorageService = this; // eslint-disable-line
        }

        this.$log = $log;

        this.MAX_ELEMENTS = 3;

        this.$storage = $localStorage.$default({
            shortenUrl: []
        });

        this.slice();
    }

    getUrls() {
        return this.$storage.shortenUrl;
    }

    addUrl(url) {
        this.$storage.shortenUrl.push(url);

        this.slice();
    }

    remove(url) {
        this.$storage.shortenUrl = this.$storage.shortenUrl.filter(e => e.shorten_url !== url);
    }

    slice() {
        const length = this.$storage.shortenUrl.length;

        if (length > this.MAX_ELEMENTS) {
            this.$storage.shortenUrl = this.$storage.shortenUrl.slice(length - this.MAX_ELEMENTS);
        }
    }

    update(old, newObj) {
        const obj = this.$storage.shortenUrl.find(e => e.shorten_url === old);

        if (obj) {
            obj.shorten_url = newObj.shorten_url;
            obj.clicks = newObj.clicks;
            obj.created_on = newObj.created_on;
            obj.fullUrl = newObj.fullUrl;
            obj.token = newObj.token;
        }

    }
}

angular.module('wizeshort')
    .service('StorageService', StorageService);
