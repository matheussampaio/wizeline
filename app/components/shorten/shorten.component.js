class ShortenController {
    /* @ngInject */
    constructor($log, $mdToast, $mdDialog, ShortenService, LoadingService, StorageService, WireshortDebug) {
        if (WireshortDebug) {
            window.mShortenController = this; //eslint-disable-line
        }

        this.$log = $log;
        this.$mdToast = $mdToast;
        this.$mdDialog = $mdDialog;

        this.ShortenService = ShortenService;
        this.LoadingService = LoadingService;
        this.StorageService = StorageService;

        this.shortLink = null;
        this.shorting = false;
        this.url = '';

        this.errors = {
            INVALID_URL: 'ERROR: Invalid URL',
            CUSTOM_URL_TAKEN: 'ERRROR: Custom url taken',
            INVALID_CHAR_PARAM: 'ERROR: Invalid char:',
            BACKEND_URL: 'ERRROR: URL not available',
            SAME_URL: 'You didn\'t change anything'
        };
    }

    shortenUrl() {
        this.LoadingService.start();
        this.shorting = true;
        this.previousUrl = this.url;

        this.ShortenService.shortenUrl(this.url)
            .then((data) => {
                this.data = data.shorten;
                this.data.fullUrl = this.ShortenService.$location.absUrl() + this.data.shorten_url;

                this.url = this.data.fullUrl;

                this.StorageService.addUrl(this.data);

                this.LoadingService.stop();
                this.shorting = false;
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
        let content = this.errors[error.code];

        if (error.code === 'INVALID_CHAR_PARAM') {
            content += ` '${error.invalid}'`;
        }

        this.$mdToast.show(
            this.$mdToast.simple().textContent(content)
        );
    }

    clearUrl() {
        this.url = '';
    }

    customizeUrl(event) {
        const confirm = this.$mdDialog.prompt()
            .title('Customize your url:')
            .placeholder('Custom Url')
            .ariaLabel('Custom Url')
            .initialValue('')
            .targetEvent(event)
            .ok('Save')
            .cancel('Cancel');

        this.$mdDialog.show(confirm)
            .then(customUrl => this.onSave(customUrl))
            .catch(() => {});
    }

    onSave(customUrl) {
        this.LoadingService.start();
        this.shorting = true;
        this.previousUrl = this.url;

        const body = {
            url: this.url,
            custom: customUrl
        };

        this.ShortenService.shortenCustomUrl(body)
            .then((data) => {
                this.data = data.shorten;
                this.data.fullUrl = this.ShortenService.$location.absUrl() + this.data.shorten_url;

                this.url = this.data.fullUrl;

                this.StorageService.addUrl(this.data);

                this.LoadingService.stop();
                this.shorting = false;
            })
            .catch((response) => {
                this.error = response.data;

                this.showErrorToast(response.data.error);

                this.LoadingService.stop();
                this.shorting = false;
            });
    }
}

angular.module('wizeshort').component('shorten', {
    controller: ShortenController,
    templateUrl: 'shorten/shorten.html'
});
