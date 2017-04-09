class LoadingService {
    /* @ngInject */
    constructor() {
        this.mLoadingService = this;

        this._status = false;
    }

    start() {
        this._status = true;
    }

    stop() {
        this._status = false;
    }

    isLoading() {
        return this._status;
    }
}

angular.module('wizeshort').service('LoadingService', LoadingService);
