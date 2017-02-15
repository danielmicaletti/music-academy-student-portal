(function () {
    'use strict';

    angular
        .module('mga', [
            'ngAnimate',
            'ngTouch',
            'ngSanitize',
            'ngCookies',
            'ngFileUpload',
            'ngAudio',
            'angularMoment',
            'monospaced.elastic',
            'ui.router',
            'ui.bootstrap',
            'ui.select',
            'mwl.calendar',
            'mga.config',
            'mga.routes',
            'main',
            'users',
            'forum',
            'schedule'
        ]);

    angular
        .module('mga.config', ['ui.router']);

    angular
        .module('mga.routes', ['ui.router.router']);

    angular
        .module('mga')
        .run(runCSRF);

    runCSRF.$inject = ['$http'];

    function runCSRF($http) {
        $http.defaults.xsrfHeaderName = 'X-CSRFToken';
        $http.defaults.xsrfCookieName = 'csrftoken';
    };

    angular
        .module('mga')
        .run(runIsAuthAcct);

    runIsAuthAcct.$inject = ['$rootScope', '$state', 'Main'];

    function runIsAuthAcct($rootScope, $state, Main){
        $rootScope.$on('$stateChangeStart', function(event, toState, toParams){
            var requireLogin = toState.data.requireLogin;
            var auth = Main.isAuthAcct();

            if(requireLogin && !auth){
                event.preventDefault();
                $state.go('login');
                return $rootScope;
            };
        });
    };

})();