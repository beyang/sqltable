angular.module('sqltable-example', [
  'ui.router',
  'sqltable',
])

.config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/table?select=count(*)&from=track.instance&where=&groupBy=client_id&orderBy=');

  $stateProvider.state('table', {
    url: '/table?select&from&where&groupBy&orderBy',
    templateProvider: function($stateParams) {
      return '<sqltable select="'+$stateParams.select+'" from="'+$stateParams.from+'" where="'+$stateParams.where+'" group-by="'+$stateParams.groupBy+'" order-by="'+$stateParams.orderBy+'" background-color="white"></sqltable>';
    },
  });
})

;
