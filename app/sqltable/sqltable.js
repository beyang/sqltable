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
    scope: {},
    templateUrl: '/sqltable/sqltable.tpl.html',
    controller: function($scope, sqltableServer) {
      $scope.updateQuery = function($event) {
        $scope.query = $scope.queryInProgress;
        $scope.data = sqltableServer.get({'query':$scope.query});
      };
      $scope.data = {};
    },
  };
})

;
