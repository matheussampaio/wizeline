class ShortenResource {
    /* @ngInject */
    constructor($resource, WireshortDebug) {
        if (WireshortDebug) {
            window.mShortenResource = this; // eslint-disable-line
        }

        this.resource = $resource('/api/shorten/:id');
    }

    get() {
        return this.resource;
    }
}

angular.module('wizeshort')
    .service('ShortenResource', ShortenResource);
