(function(){
    'use strict';

    angular
        .module('main.controllers')
        .controller('CommonRoomController', CommonRoomController);

    CommonRoomController.$inject = ['$scope', '$state', '$stateParams', 'Main', 'Users'];

    function CommonRoomController($scope, $state, $stateParams, Main, Users){
        var vm = this;

        function activate(){
            if(Main.isAuthAcct()){
                vm.authAcct = Main.getAuthAcct();
                if($stateParams.userId && vm.authAcct.is_staff){
                    vm.commonRoomId = $stateParams.userId;                   
                } else {
                    vm.commonRoomId = vm.authAcct.id;
                    $state.transitionTo('app.commonroom', {userId: vm.commonRoomId}, { notify: false });
                }
                getUser(vm.commonRoomId);
            } else {
                $state.go('login');
            };
        };

        function getUser(id){
            Users.getUser(id)
                .then(getUserSuccess)
                .catch(getUserError);
        };

        function getUserSuccess(response){
            vm.user = response;
        };

        function getUserError(errMsg){
            console.log(errMsg);
            Main.logout();
        };

        activate();
    };
})();
