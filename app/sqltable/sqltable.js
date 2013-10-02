angular.module('sqltable', [
  'ngResource',
  'ui.directives',
])

.factory('sqltableServer', function($resource) {
  return $resource('/query');
})

.directive('sqltable', function() {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      query: "@query",
    },
    templateUrl: '/sqltable/sqltable.tpl.html',
    controller: function($scope, sqltableServer) {
      $scope.queryInProgress = $scope.query;

      $scope.updateQuery = function($event) {
        $scope.query = $scope.queryInProgress;
        $scope.data = sqltableServer.get({'query':$scope.query});
      };
      $scope.expandGroup = function(row, col) {
        console.log(row, col);
      }
      $scope.data = {};
    },
  };
})

;
