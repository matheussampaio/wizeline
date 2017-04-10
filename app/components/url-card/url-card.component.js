class UrlCardController {
    /* @ngInject */
    constructor($log, $mdToast, $mdDialog, ShortenService, LoadingService, StorageService) {
        this.$log = $log;
        this.$mdToast = $mdToast;
        this.$mdDialog = $mdDialog;

        this.ShortenService = ShortenService;
        this.LoadingService = LoadingService;
        this.StorageService = StorageService;
    }

    $onInit() {
        this.ShortenService.get(this.url.shorten_url)
            .then((response) => {
                this.url.clicks = response.clicks;
            });

        this.editing = false;
    }

    copyUrl() {
        this.$log.log('ShortenController::copyUrl', this.url.fullUrl);

        document.querySelector(`#${this.url.shorten_url}`).select(); // eslint-disable-line
        document.execCommand('copy'); // eslint-disable-line

        this.showCopyToast();
    }

    showCopyToast() {
        this.$mdToast.show(
            this.$mdToast.simple().textContent('Url copied')
        );
    }

    edit(event) {
        const confirm = this.$mdDialog.prompt()
            .title('Customize your url:')
            .placeholder('Custom Url')
            .ariaLabel('Custom Url')
            .initialValue(this.url.shorten_url)
            .targetEvent(event)
            .ok('Save')
            .cancel('Cancel');

        this.$mdDialog.show(confirm)
            .then(customUrl => this.onSave(customUrl));
    }

    onSave(customUrl) {
        this.LoadingService.start();

        this.ShortenService.shortenCustomUrl(this.url.long_url, customUrl)
            .then((data) => {
                this.LoadingService.stop();

                const shorten = data.shorten;

                shorten.fullUrl = this.ShortenService.absUrl + shorten.shorten_url;

                this.StorageService.update(this.url.shorten_url, shorten);
            })
            .catch((response) => {
                this.LoadingService.stop();

                this.shortenCtrl.showErrorToast(response.data.error);
            });
    }
}

angular.module('wizeshort').component('urlCard', {
    controller: UrlCardController,
    templateUrl: 'url-card/url-card.html',
    require: {
        shortenCtrl: '^shorten'
    },
    bindings: {
        url: '<'
    }
});
