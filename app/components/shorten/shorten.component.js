class ShortenController {
    /* @ngInject */
    constructor($log, ShortenService) {
        window.mShortenController = this; //eslint-disable-line

        this.$log = $log;

        this.ShortenService = ShortenService;

        this.shortLink = null;
        this.url = 'http://www.google.com';
    }

    shortenUrl() {
        this.previousUrl = this.url;
        this.ShortenService.shortenUrl(this.url)
            .then((data) => {
                this.data = data.shorten;
                this.data.fullUrl = this.ShortenService.absUrl + this.data.shorten_url;

                this.url = this.data.fullUrl;
            })
            .catch((error) => {
                this.error = error;
            });
    }

    copyUrl() {
        this.$log.log('ShortenController::copyUrl', this.data.fullUrl);

        document.querySelector('#url').select(); // eslint-disable-line
        document.execCommand('copy'); // eslint-disable-line
    }
}

angular
    .module('wizeshort')
    .component('shorten', {
        controller: ShortenController,
        templateUrl: 'shorten/shorten.html'
    });
