class ShortService {
    /* @ngInject */
    constructor($log, $location, ShortResource) {
        window.mShortService = this; // eslint-disable-line

        this.$log = $log;

        this.absUrl = $location.absUrl();
        this.resource = ShortResource.get();
    }

    shortUrl(url) {
        this.$log.log('ShortService::shortUrl', { url });

        return this.resource.save({ url }).$promise;
    }
}

angular.module('wizeshort')
    .service('ShortService', ShortService);
