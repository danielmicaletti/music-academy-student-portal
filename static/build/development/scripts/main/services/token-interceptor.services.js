(function(){
    'use strict';

    angular
        .module('main.services')
        .factory('tokenInterceptor', tokenInterceptor);

    tokenInterceptor.$inject = ['$q', '$cookies'];

    function tokenInterceptor($q, $cookies){
        return {
            request: function (config){
                var url = config.url.slice(0,7);
                var apiUrl = (url === 'api/v1/');
                if(apiUrl && ($cookies.getObject('authAcct') ? true : false)){
                    var authToken = $cookies.getObject('authAcct');
                    config.headers['Authorization'] = 'JWT '+authToken.token;
                };
                return config;
            }
        };
    };
})();
