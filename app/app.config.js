let DEBUG_MODE = true; // eslint-disable-line

// gulp-inject-debug-mode

function WizeshortConfig($stateProvider, $urlRouterProvider, $locationProvider, $mdThemingProvider,
    $localStorageProvider, $compileProvider, $logProvider) {
    $compileProvider.preAssignBindingsEnabled(true);

    $mdThemingProvider.definePalette('wizeshortPalette', {
        50: '#ffebee',
        100: '#ffcdd2',
        200: '#ef9a9a',
        300: '#e57373',
        400: '#ef5350',
        500: '#262e30',
        600: '#e53935',
        700: '#d32f2f',
        800: '#c62828',
        900: '#b71c1c',
        A100: '#ff8a80',
        A200: '#ff5252',
        A400: '#ff1744',
        A700: '#d50000',

        // whether, by default, text (contrast) on this palette should be dark or light
        contrastDefaultColor: 'light',

        //hues which contrast should be 'dark' by default
        contrastDarkColors: ['50', '100', '200', '300', '400', 'A100'],
        contrastLightColors: undefined    // could also specify this if default was 'dark'
    });

    $mdThemingProvider.theme('default')
        .primaryPalette('wizeshortPalette');

    $localStorageProvider.setKeyPrefix('wizeshort');

    $logProvider.debugEnabled(DEBUG_MODE);

    const appState = {
        name: 'app',
        template: '<app flex layout="column"></app>',
        abstract: true
    };

    const shortenState = {
        url: '/',
        name: 'shorten',
        parent: 'app',
        template: '<shorten layout flex></shorten>'
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

angular.module('wizeshort')
    .config(WizeshortConfig)
    .constant('WireshortDebug', DEBUG_MODE);
