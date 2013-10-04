angular.module('sqltable', [
  'ngResource',
  'ui.directives',
  'ui.router',
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

    var str = 'SELECT ' + query.groupBy.concat(query.select).join(', ') + ' FROM ' + query.from.join(', ');
    if (query.where.length > 0) {
      str += ' WHERE (' + query.where.join(') AND (') + ')';
    }
    if (query.groupBy.length > 0) {
      str += ' GROUP BY ' + query.groupBy.join(', ');
    }
    if (query.orderBy.length > 0) {
      str += ' ORDER BY ' + query.orderBy.join(', ');
    }
    str += ' LIMIT 100';
    return str;
  };
})

.directive('sqltableWrapper', function() {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      query: "@query",
    },
    template: "<div ng-include=\"'sqltable/sqltableInclude.html'\"></div>",
    controller: function($scope) {
      var query = JSON.parse($scope.query);
      $scope.select = query.select.join('\n');
      $scope.from = query.from.join('\n');
      $scope.where = query.where.join('\n');
      $scope.orderBy = query.orderBy.join('\n');
      $scope.groupBy = query.groupBy.join('\n');
    },
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
      groupBy: "@groupBy",
      orderBy: "@orderBy",
      notRoot: "@notRoot",
      backgroundColor: "@backgroundColor",
    },
    templateUrl: '/sqltable/sqltable.tpl.html',
    link: function(scope, elem, attr) {
      if (scope.backgroundColor) {
        elem.css('backgroundColor', scope.backgroundColor);
      }
    },
    controller: function($scope, $state, sqltableServer, queryToString) {
      console.log('initing table');

      // Wiring
      var syncDataToQuery = function() {
        $scope.data = sqltableServer.get({'query':$scope.queryString()}, function(){
          $scope.error = undefined;
        }, function(response) {
          $scope.error = response.data;
        });
      };

      var saveQuery = function() {
        if (!$scope.notRoot) {
          $state.go('table', {
            select: $scope.query.select.join('\n'),
            from: $scope.query.from.join('\n'),
            where: $scope.query.where.join('\n'),
            groupBy: $scope.query.groupBy.join('\n'),
            orderBy: $scope.query.orderBy.join('\n'),
          });
        }
        syncDataToQuery();
      };

      var updateInputs = function () {
        $scope.select = $scope.query.select.join('\n');
        $scope.from = $scope.query.from.join('\n');
        $scope.where = $scope.query.where.join('\n');
        $scope.groupBy = $scope.query.groupBy.join('\n');
        $scope.orderBy = $scope.query.orderBy.join('\n');
      }

      $scope.showControls = false;
      $scope.rowSubQueries = {};
      $scope.queryString = function() {
        return queryToString($scope.query);
      }

      $scope.updateQuery = function() {
        $scope.query = {
          'select': ($scope.select ? $scope.select.split('\n') : []),
          'from' : ($scope.from ? $scope.from.split('\n') : []),
          'where' : ($scope.where ? $scope.where.split('\n') : []),
          'groupBy' : ($scope.groupBy ? $scope.groupBy.split('\n') : []),
          'orderBy' : ($scope.orderBy ? $scope.orderBy.split('\n') : []),
        };
        syncDataToQuery();
      };

      $scope.toggleQueryInput = function() {
        $scope.showControls = !$scope.showControls;
        if (!$scope.showControls) {
          saveQuery();
        }
      };

      $scope.toggleGroupBy = function(col) {
        if (col < $scope.query.groupBy.length) {
          // group column
          $scope.query.groupBy.splice(col, 1);
        } else {
          // select column
          var selectClause;
          if ($scope.query.select.length === 1 && $scope.query.select[0].trim() === '*') {
            selectClause = $scope.data.columnNames[col];
          } else {
            var numGroupBys = $scope.query.groupBy ? $scope.query.groupBy.length : 0;
            var selIndex = col - numGroupBys;
            selectClause = $scope.query.select[selIndex];
          }
          $scope.query.groupBy.push(selectClause);
          $scope.query.select = ['count(*)'];
        }
        updateInputs();
        syncDataToQuery();
        saveQuery();
      };

      $scope.toggleExpandRow = function(row, col) {
        if ($scope.rowSubQueries[row]) {
          $scope.rowSubQueries[row] = undefined;
          return;
        }

        // Maybe derive drilldown query and expand
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

        var gIndex = col >= $scope.query.groupBy.length ? -1 : col;
        if (gIndex >= 0) {
          var drillQuery = {
            'select': undefined,  // initialized later on
            'from': $scope.query.from.slice(0),
            'where': $scope.query.where.slice(0),
            'groupBy': $scope.query.groupBy.slice(0),
            'orderBy': $scope.query.orderBy.slice(0),
          };

          var drillGroup = drillQuery['groupBy'].splice(gIndex, 1); // (note: drillGroup is often, but not always equal to colName)
          drillQuery['where'].push(drillGroup+valClause);

          if (drillQuery['groupBy'].length === 0) {
            drillQuery['select'] = ['*'];
          } else {
            drillQuery['select'] = ['count(*)'];
          }
          $scope.rowSubQueries[row] = drillQuery;
        } else {
          console.log('nothing to drill');
        }
      };

      $scope.seeAll = function() {
        $scope.query = {
          select: ['*'],
          from: $scope.query.from,
          where: $scope.query.where,
          groupBy: [],
          orderBy: [],
        };
        saveQuery();
      };

      // Initialization
      $scope.updateQuery();
    },
  };
})

;
