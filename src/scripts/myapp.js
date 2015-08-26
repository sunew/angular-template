'use strict';

angular
  .module('myNgApp', [
    'ngCookies',
    'ngRoute',
    'ui.utils',
    'ui.bootstrap',
    'ajoslin.promise-tracker',
  ])
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider
      .when('/', {
        redirectTo: '/home'
      })
      .when('/home', {
        templateUrl: '/html/home.html',
        controller: 'HomeController'
      })
      .otherwise({
        redirectTo: '/'
      });
  }])
  .config(['$logProvider', function ($logProvider) {
    $logProvider.debugEnabled(true);
  }])
;
