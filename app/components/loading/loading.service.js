class LoadingService {
    /* @ngInject */
    constructor(WireshortDebug) {
        if (WireshortDebug) {
            window.mLoadingService = this; // eslint-disable-line
        }

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
