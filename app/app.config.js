function WizeshortConfig($stateProvider, $urlRouterProvider, $locationProvider) {
    $stateProvider
        .state('home', {
            url: '/',
            template: '<app></app>'
        });

    $urlRouterProvider.otherwise('/');

    $locationProvider.html5Mode(true);
}

angular.module('wizeshort').config(WizeshortConfig);
