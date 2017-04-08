class ShortResource {
    /* @ngInject */
    constructor($resource) {
        window.mShortResource = this; // eslint-disable-line

        this.resource = $resource('/api/short');
    }

    get() {
        return this.resource;
    }
}

angular.module('wizeshort')
    .service('ShortResource', ShortResource);
