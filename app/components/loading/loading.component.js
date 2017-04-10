class LoadingController {
    /* @ngInject */
    constructor(LoadingService, WireshortDebug) {
        if (WireshortDebug) {
            window.mLoadingController = this; // eslint-disable-line
        }

        this.LoadingService = LoadingService;
    }
}

angular.module('wizeshort').component('loading', {
    controller: LoadingController,
    templateUrl: 'loading/loading.html'
});
