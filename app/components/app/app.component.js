class AppController {
    /* @ngInject */
    constructor() {
        window.mAppController = this; //eslint-disable-line
    }
}

angular
    .module('wizeshort')
    .component('app', {
        controller: AppController,
        templateUrl: 'app/app.html'
    });
