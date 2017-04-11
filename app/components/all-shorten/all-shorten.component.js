class AllShortenController {
    /* @ngInject */
    constructor($log, ShortenService, WireshortDebug) {
        if (WireshortDebug) {
            window.mAllShortenController = this; //eslint-disable-line
        }

        this.$log = $log;

        this.ShortenService = ShortenService;

        this.data = {};
    }

    $onInit() {
        this.query = {
            limit: 10,
            page: 1
        };

        this.getUrls = () => {
            this.promise = this.ShortenService.getAll(this.query)
                .then((data) => {
                    this.data = data;
                });
        };

        this.getUrls();
    }
}

angular
    .module('wizeshort')
    .component('allShorten', {
        controller: AllShortenController,
        templateUrl: 'all-shorten/all-shorten.html'
    });
