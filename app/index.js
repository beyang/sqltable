angular.module('sqltable-example', [
  'ui.router',
  'sqltable',
])

.config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/table');

  $stateProvider.state('table', {
    url: '/table?select&from&where&groupBy&orderBy',
    templateProvider: function($stateParams) {
      var select = $stateParams.select ? $stateParams.select : '';
      var from = $stateParams.from ? $stateParams.from : '';
      var where = $stateParams.where ? $stateParams.where : '';
      var groupBy = $stateParams.groupBy ? $stateParams.groupBy : '';
      var orderBy = $stateParams.orderBy ? $stateParams.orderBy : '';
      return '<sqltable select="'+select+'" from="'+from+'" where="'+where+'" group-by="'+groupBy+'" order-by="'+orderBy+'" background-color="white"></sqltable>';
    },
  });
})

;
