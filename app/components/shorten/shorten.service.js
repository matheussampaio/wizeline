class ShortenService {
    /* @ngInject */
    constructor($log, $location, ShortenResource) {
        window.mShortenService = this; // eslint-disable-line

        this.$log = $log;

        this.absUrl = $location.absUrl();
        this.resource = ShortenResource.get();
    }

    shortenUrl(url) {
        this.$log.log('ShortenService::shortenUrl', { url });

        return this.resource.save({ url }).$promise;
    }
}

angular.module('wizeshort')
    .service('ShortenService', ShortenService);
