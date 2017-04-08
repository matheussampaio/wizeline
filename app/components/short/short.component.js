class ShortController {
    /* @ngInject */
    constructor($log, ShortService) {
        window.mShortController = this; //eslint-disable-line

        this.$log = $log;

        this.ShortService = ShortService;

        this.shortLink = null;
        this.url = 'http://www.google.com';
    }

    shortUrl() {
        this.previousUrl = this.url;
        this.ShortService.shortUrl(this.url)
            .then((data) => {
                this.short = data.short;
                this.short.fullUrl = this.ShortService.absUrl + this.short.short_url;

                this.url = this.short.fullUrl;
            })
            .catch((error) => {
                this.error = error;
            });
    }

    copyUrl() {
        this.$log.log('ShortController::copyUrl', this.short.fullUrl);

        document.querySelector('#url').select(); // eslint-disable-line
        document.execCommand('copy'); // eslint-disable-line
    }
}

angular
    .module('wizeshort')
    .component('short', {
        controller: ShortController,
        templateUrl: 'short/short.html'
    });
