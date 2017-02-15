(function(){
    'use strict';

    angular
        .module('main.services')
        .factory('Main', Main);

    Main.$inject = ['$http', '$q', '$state', '$cookies'];

    function Main($http, $q, $state, $cookies) {
        var vm = this;

        var Main = {
            login: login,
            logout: logout,
            register: register,
            loginToken: loginToken,
            refreshToken: refreshToken,
            setAuthAcct: setAuthAcct,
            getAuthAcct: getAuthAcct,
            isAuthAcct: isAuthAcct,
            isStaffAcct: isStaffAcct,
        };

        return Main;

        function generalCallbackSuccess(response){
            return response.data;
        };

        function generalCallbackError(response){
            return $q.reject(response);
        };

        function login(username, password){
            return $http.post('api/v1/auth/login/', {
                username: username, 
                password: password,
            }).then(function(response){
                return Main.loginToken(response.data, password);
                
            }).catch(generalCallbackError);
        };

        function loginToken(user, password){
            return $http.post('api/v1/auth/token/', {
                username: user.username,
                password: password,
            }).then(function(response){
                Main.setAuthAcct(user, response.data);
                Main.refreshToken(user);
                return user;
            }).catch(function(errMsg){
                console.log(errMsg);
                $state.go('login');
            });
        };

        function loginSuccess(response){
            Main.setAuthAcct(response.data);
            return response.data
        };

        function register(newUser){
            return $http.post('/api/v1/users/', newUser)
                .then(generalCallbackSuccess)
                .catch(generalCallbackError);
        };

        function refreshToken(user){
            var authToken = $cookies.getObject('authAcct');
            return $http.post('api/v1/auth/refresh/', {
                token: authToken.token
            }).then(function(response){
                Main.setAuthAcct(user, response.data);
                return true;
            }).catch(function(errMsg){
                console.log(errMsg);
                return false;
            });
        };

        function setAuthAcct(user, authToken){
            // localStorage.setItem('authAcct', JSON.stringify({'id':acct.id, 'is_staff':acct.is_admin, 'notification':''}));
            $cookies.putObject('authAcct', {'id':user.id, 'is_staff':user.is_admin, 'is_admin':user.is_admin, 'notification':'', 'token': authToken.token});
            return true;
        };

        function getAuthAcct(){
            // return JSON.parse(localStorage.getItem('authAcct'));
            return $cookies.getObject('authAcct');
        };

        function isAuthAcct(){
            if($cookies.getObject('authAcct')){
                var authToken = $cookies.getObject('authAcct');
                return $http.post('api/v1/auth/verify/', {
                    token: authToken.token
                }).then(function(response){
                    return true;
                }).catch(function(errMsg){
                    console.log(errMsg);
                    return false;
                });
            } else {
                return false;
            };
        };

        function isStaffAcct(){
            var acct = $cookies.getObject('authAcct');
            return acct.is_staff;
        };

        function logout(){
            $cookies.remove('authAcct');
            return $http.post('api/v1/auth/logout/')
                .then(logoutSuccess)
                .catch(generalCallbackError);
        };

        function logoutSuccess(response) {
            $cookies.remove('authAcct');
            $state.go('login');
        };
    };
})();
