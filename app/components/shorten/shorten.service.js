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

    getAll(query = {}) {
        this.$log.log('ShortenService::getAll');

        return this.resource.get(query).$promise;
    }

    deleteUrl(id, token) {
        this.$log.log('ShortenService::deleteUrl', { id, token });

        return this.resource.delete({ id, token }).$promise;
    }

    shortenUrl(url) {
        this.$log.log('ShortenService::shortenUrl', { url });

        return this.resource.save({ url }).$promise;
    }

    shortenCustomUrl({ url, custom, shortenUrl, token }) {
        this.$log.log('ShortenService::shortenCustomUrl', { url, custom, shortenUrl, token });

        return this.resource.custom({ url, custom, shortenUrl, token }).$promise;
    }
}

angular.module('wizeshort')
    .service('ShortenService', ShortenService);
