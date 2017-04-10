class ShortenController {
    /* @ngInject */
    constructor($log, $mdToast, ShortenService, LoadingService, StorageService, WireshortDebug) {
        if (WireshortDebug) {
            window.mShortenController = this; //eslint-disable-line
        }

        this.$log = $log;
        this.$mdToast = $mdToast;

        this.ShortenService = ShortenService;
        this.LoadingService = LoadingService;
        this.StorageService = StorageService;

        this.shortLink = null;
        this.shorting = false;
        this.url = '';

        this.errors = {
            INVALID_URL: 'Invalid URL',
            CUSTOM_URL_TAKEN: 'Custom url taken'
        };
    }

    shortenUrl() {
        this.LoadingService.start();
        this.shorting = true;
        this.previousUrl = this.url;

        this.ShortenService.shortenUrl(this.url)
            .then((data) => {
                this.data = data.shorten;
                this.data.fullUrl = this.ShortenService.absUrl + this.data.shorten_url;

                this.url = this.data.fullUrl;

                this.StorageService.addUrl(this.data);

                this.LoadingService.stop();
                this.shorting = false;
                this.$log.log('shorten', this.data);
            })
            .catch((response) => {
                this.error = response.data;

                this.showErrorToast(response.data.error);

                this.LoadingService.stop();
                this.shorting = false;
            });
    }

    copyUrl() {
        this.$log.log('ShortenController::copyUrl', this.data.fullUrl);

        document.getElementById('url').select(); // eslint-disable-line
        document.execCommand('copy'); // eslint-disable-line
    }

    showErrorToast(error) {
        this.$mdToast.show(
            this.$mdToast.simple().textContent(this.errors[error.code])
        );
    }
}

angular.module('wizeshort').component('shorten', {
    controller: ShortenController,
    templateUrl: 'shorten/shorten.html'
});
