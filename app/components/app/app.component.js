class AppController {
    /* @ngInject */
    constructor(LoadingService) {
        window.mAppController = this; //eslint-disable-line

        this.LoadingService = LoadingService;
    }
}

angular
    .module('wizeshort')
    .component('app', {
        controller: AppController,
        templateUrl: 'app/app.html'
    });
