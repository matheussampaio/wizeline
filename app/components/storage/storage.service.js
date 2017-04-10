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

    slice() {
        const length = this.$storage.shortenUrl.length;

        if (length > this.MAX_ELEMENTS) {
            this.$storage.shortenUrl = this.$storage.shortenUrl.slice(length - this.MAX_ELEMENTS);
        }
    }
}

angular.module('wizeshort')
    .service('StorageService', StorageService);
