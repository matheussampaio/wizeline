class NotFoundController {
    /* @ngInject */
    constructor($log, WireshortDebug) {
        if (WireshortDebug) {
            window.mNotFoundController = this; //eslint-disable-line
        }

        this.$log = $log;
    }
}

angular
    .module('wizeshort')
    .component('notFound', {
        controller: NotFoundController,
        templateUrl: 'not-found/not-found.html'
    });
