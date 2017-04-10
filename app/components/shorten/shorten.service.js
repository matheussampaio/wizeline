class ShortenService {
    /* @ngInject */
    constructor($log, $location, ShortenResource, WireshortDebug) {
        if (WireshortDebug) {
            window.mShortenService = this; // eslint-disable-line
        }

        this.$log = $log;

        this.absUrl = $location.absUrl();
        this.resource = ShortenResource.get();
    }

    get(shortenUrl) {
        return this.resource.get({ id: shortenUrl }).$promise;
    }

    getAll() {
        this.$log.log('ShortenService::getAll');

        return this.resource.get().$promise;
    }

    shortenUrl(url) {
        this.$log.log('ShortenService::shortenUrl', { url });

        return this.resource.save({ url }).$promise;
    }
}

angular.module('wizeshort')
    .service('ShortenService', ShortenService);
