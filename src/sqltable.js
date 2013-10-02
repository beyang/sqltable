angular.module('sqltable', [

])

.directive('sqltable', function() {
  return {
    restrict: 'E',
    replace: true,
    scope: {},
    templateUrl: '/src/sqltable.tpl.html',
    // link: function(scope, elem, attr) {
    //   // TODO
    // },
    controller: function($scope) {
      $scope.select = '';
      $scope.from = '';
      $scope.where = '';
      $scope.groupBy = '';
      $scope.orderBy = '';

      var syncQuery = function() {
        var select = $scope.select;
        var from = $scope.from;
        var where = $scope.where;
        var groupBy = $scope.groupBy;
        var orderBy = $scope.orderBy;
        $scope.query = 'SELECT '+$scope.select+' FROM '+$scope.from+' WHERE '+$scope.where+' GROUP BY '+$scope.groupBy+' ORDER BY '+$scope.orderBy;
      };

      var clauses = ['select', 'from', 'where', 'groupBy', 'orderBy'];
      clauses.forEach(function(clause) {
        $scope.$watch(clause, function() {
          syncQuery()
        });
      });
    }
  };
})

;
