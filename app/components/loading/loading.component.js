class LoadingController {
    /* @ngInject */
    constructor(LoadingService, WireshortDebug) {
        if (WireshortDebug) {
            window.LoadingService = LoadingService; // eslint-disable-line
        }
    }
}

angular.module('wizeshort').component('loading', {
    controller: LoadingController,
    templateUrl: 'loading/loading.html'
});
