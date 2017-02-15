(function(){
    'use strict';

    angular
        .module('main.controllers')
        .controller('LogoutController', LogoutController);

    LogoutController.$inject = ['$state', 'Main'];

    function LogoutController($state, Main){
        var vm = this;

        function activate(){
            if(Main.isAuthAcct()){
                Main.logout();
            } else {
                $state.go('login');
            };
        };

        activate();
    };
})();
