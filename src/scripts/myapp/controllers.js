'use strict';

angular.module('myNgApp')
 .controller('HomeController', ['$scope','$location','$log',
    function($scope, $location, $log) {


      $scope.showDebug = false;

      $scope.show_hide_debug_info = function(){
        if($scope.showDebug){
          $scope.showDebug = false;
        }
        else{
          $scope.showDebug = true;
        }
      };
  }])
;
