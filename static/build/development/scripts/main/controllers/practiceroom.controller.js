(function(){
    'use strict';

    angular
        .module('main.controllers')
        .controller('PracticeRoomController', PracticeRoomController);

    PracticeRoomController.$inject = ['$scope', '$state', '$stateParams', 'Main', 'Users'];

    function PracticeRoomController($scope, $state, $stateParams, Main, Users){
        var vm = this;

        function activate(){
            if(Main.isAuthAcct()){
                vm.authAcct = Main.getAuthAcct();
                if($stateParams.userId && vm.authAcct.is_staff){
                    vm.practiceRoomId = $stateParams.userId;                   
                } else {
                    vm.practiceRoomId = vm.authAcct.id;
                    $state.transitionTo('app.practiceroom', {userId: vm.practiceRoomId}, { notify: false });
                };
                getUser(vm.practiceRoomId);
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
