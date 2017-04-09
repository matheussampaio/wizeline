class LoadingController {
    /* @ngInject */
    constructor(LoadingService) {
        this.LoadingService = LoadingService;
    }
}

angular.module('wizeshort').component('loading', {
    controller: LoadingController,
    templateUrl: 'loading/loading.html'
});
