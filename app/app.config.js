function WizeshortConfig($stateProvider, $urlRouterProvider, $locationProvider) {

    const appState = {
        name: 'app',
        template: '<app flex layout="column"></app>',
        abstract: true
    };

    const shortenState = {
        url: '/',
        name: 'shorten',
        parent: 'app',
        template: '<shorten flex layout="column" layout-align="center center"></shorten>'
    };

    const allShortenState = {
        url: '/urls',
        name: 'urls',
        parent: 'app',
        template: '<all-shorten></all-shorten>'
    };

    $stateProvider
        .state(appState)
            .state(shortenState)
            .state(allShortenState);

    $urlRouterProvider.otherwise('/');

    $locationProvider.html5Mode(true);
}

angular.module('wizeshort').config(WizeshortConfig);
