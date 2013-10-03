angular.module('sqltable', [
  'ngResource',
  'ui.directives',
])

.factory('sqltableServer', function($resource) {
  return $resource('/query');
})

.factory('queryToString', function() {
  return function(query) {
    if (!query) {
      return "";
    }
    if (query.select.length === 0 || query.from.length === 0) {
      return "";
    }

    var str = 'SELECT ' + query.select.join(', ') + ' FROM ' + query.from.join(', ');
    if (query.where.length > 0) {
      str += ' WHERE (' + query.where.join(') AND (') + ')';
    }
    if (query.groupBy.length > 0) {
      str += ' GROUP BY ' + query.groupBy.join(', ');
    }
    if (query.orderBy.length > 0) {
      str += ' ORDER BY ' + query.orderBy.join(', ');
    }
    return str;
  };
})

.directive('sqltable', function() {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      select: "@select",
      from: "@from",
      where: "@where",
      groupBy: "@groupby",
      orderBy: "@orderby",
    },
    templateUrl: '/sqltable/sqltable.tpl.html',
    controller: function($scope, sqltableServer, queryToString) {
      // Wiring
      $scope.queryString = function() {
        return queryToString($scope.query);
      }

      $scope.updateQuery = function() {
        $scope.query = {
          'select': ($scope.groupBy ? $scope.groupBy.split('\n') : []).concat($scope.select ? $scope.select.split('\n') : []),
          'from' : ($scope.from ? $scope.from.split('\n') : []),
          'where' : ($scope.where ? $scope.where.split('\n') : []),
          'groupBy' : ($scope.groupBy ? $scope.groupBy.split('\n') : []),
          'orderBy' : ($scope.orderBy ? $scope.orderBy.split('\n') : []),
        };

        $scope.data = sqltableServer.get({'query':$scope.queryString()});
      };

      $scope.expandGroup = function(row, col) {
        var colName = $scope.data.columnNames[col];
        var rawVal = $scope.data.rows[row][col];
        var valClause;
        if (typeof(rawVal) === 'string') {
          valClause = "='"+rawVal+"'";
        } else if (!rawVal) {
          valClause = ' is null';
        } else if (rawVal.toString) {
          valClause = "="+rawVal.toString();
        }

        var drillQuery = {
          'select': undefined,  // initialized later on
          'from': $scope.query.from.slice(0),
          'where': $scope.query.where.slice(0),
          'groupBy': $scope.query.groupBy.slice(0),
          'orderBy': $scope.query.orderBy.slice(0),
        };

        var gIndex = col >= $scope.query.groupBy.length ? -1 : col;
        if (gIndex >= 0) {
          var drillGroup = drillQuery['groupBy'].splice(gIndex, 1); // (note: drillGroup is often, but not always equal to colName)
          drillQuery['where'].push(drillGroup+valClause);

          if (drillQuery['groupBy'].length === 0) {
            drillQuery['select'] = ['*'];
          } else {
            drillQuery['select'] = drillQuery['groupBy'].slice(0);
            drillQuery['select'].push('count(*)');
          }

          console.log(queryToString(drillQuery));

          // TODO: add new table
        } else {
          console.log('nothing to drill');
        }
      }

      // Initialization
      $scope.updateQuery();
    },
  };
})

;
