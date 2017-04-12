class ShortenService {
    /* @ngInject */
    constructor($log, $location, ShortenResource, WireshortDebug) {
        if (WireshortDebug) {
            window.mShortenService = this; // eslint-disable-line
        }

        this.$log = $log;
        this.$location = $location;

        this.resource = ShortenResource.get();
    }

    get(shortenUrl) {
        return this.resource.get({ id: shortenUrl }).$promise;
    }

    getAll(query = {}) {
        this.$log.debug('ShortenService::getAll');

        return this.resource.get(query).$promise;
    }

    deleteUrl(id, token) {
        this.$log.debug('ShortenService::deleteUrl', { id, token });

        return this.resource.delete({ id, token }).$promise;
    }

    shortenUrl(url) {
        this.$log.debug('ShortenService::shortenUrl', { url });

        return this.resource.save({ url }).$promise;
    }

    shortenCustomUrl({ url, custom, shortenUrl, token }) {
        this.$log.debug('ShortenService::shortenCustomUrl', { url, custom, shortenUrl, token });

        return this.resource.custom({ url, custom, shortenUrl, token }).$promise;
    }
}

angular.module('wizeshort')
    .service('ShortenService', ShortenService);
