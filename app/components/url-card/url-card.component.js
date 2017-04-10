class UrlCardController {
    /* @ngInject */
    constructor($log, $mdToast, ShortenService) {
        this.$log = $log;
        this.$mdToast = $mdToast;

        this.ShortenService = ShortenService;
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

    edit() {
        this.editing = true;
    }

    save() {
        this.editing = false;
    }
}

angular.module('wizeshort').component('urlCard', {
    controller: UrlCardController,
    templateUrl: 'url-card/url-card.html',
    bindings: {
        url: '<'
    }
});
