class AllShortenController {
    /* @ngInject */
    constructor($log, ShortenService) {
        window.mAllShortenController = this; //eslint-disable-line

        this.$log = $log;

        this.ShortenService = ShortenService;

        this.data = {};
    }

    $onInit() {
        this.ShortenService.getAll()
            .then((data) => {
                this.data = data;
            });
    }
}

angular
    .module('wizeshort')
    .component('allShorten', {
        controller: AllShortenController,
        templateUrl: 'all-shorten/all-shorten.html'
    });
