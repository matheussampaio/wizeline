class ShortenResource {
    /* @ngInject */
    constructor($resource) {
        window.mShortenResource = this; // eslint-disable-line

        this.resource = $resource('/api/shorten');
    }

    get() {
        return this.resource;
    }
}

angular.module('wizeshort')
    .service('ShortenResource', ShortenResource);
