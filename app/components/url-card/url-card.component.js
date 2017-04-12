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

                this.show = true;
            })
            .catch((response) => {
                if (response.data.error.code === 'SHORTEN_URL_NOT_FOUND') {
                    this.StorageService.remove(this.url);
                }
            });

        this.editing = false;
    }

    copyUrl() {
        this.$log.debug('ShortenController::copyUrl', this.url.fullUrl);

        document.getElementById(this.url.shorten_url).select(); // eslint-disable-line
        document.execCommand('copy'); // eslint-disable-line

        this.showCopyToast();
    }

    showCopyToast() {
        this.$mdToast.show(
            this.$mdToast.simple().textContent('URL copied')
        );
    }

    customizeUrl(event) {
        const confirm = this.$mdDialog.prompt()
            .title('Customize your url:')
            .placeholder('Custom Url')
            .ariaLabel('Custom Url')
            .initialValue(this.url.shorten_url)
            .targetEvent(event)
            .ok('Save')
            .cancel('Cancel');

        this.$mdDialog.show(confirm)
            .then(customUrl => this.onSave(customUrl))
            .catch(() => {});
    }

    deleteUrl(event) {
        const confirm = this.$mdDialog.confirm()
          .title('Delete this URL?')
          .targetEvent(event)
          .ok('Delete')
          .cancel('Cancel');

        this.$mdDialog.show(confirm)
            .then(() => this.onDelete())
            .catch(() => {});
    }

    onSave(customUrl) {
        if (customUrl === this.url.shorten_url) {
            return;
        }

        this.LoadingService.start();

        const body = {
            url: this.url.long_url,
            custom: customUrl,
            token: this.url.token,
            shortenUrl: this.url.shorten_url
        };

        this.ShortenService.shortenCustomUrl(body)
            .then((data) => {
                this.LoadingService.stop();

                const shorten = data.shorten;

                shorten.fullUrl = this.ShortenService.$location.absUrl() + shorten.shorten_url;

                this.StorageService.update(this.url.shorten_url, shorten);
            })
            .catch((response) => {
                this.LoadingService.stop();

                this.shortenCtrl.showErrorToast(response.data.error);
            });
    }

    onDelete() {
        this.LoadingService.start();

        this.$log.debug('onDelete', { url: this.url });

        this.ShortenService.deleteUrl(this.url.shorten_url, this.url.token)
            .then(() => {
                this.LoadingService.stop();

                this.StorageService.remove(this.url);
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
