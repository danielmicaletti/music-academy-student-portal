(function(){
    'use strict';

    angular
        .module('main.controllers')
        .controller('StudentLockerController', StudentLockerController);

    StudentLockerController.$inject = ['$scope', '$state', '$stateParams', 'Main', 'Users'];

    function StudentLockerController($scope, $state, $stateParams, Main, Users){
        var vm = this;

        function activate(){
            if(Main.isAuthAcct()){
                vm.authAcct = Main.getAuthAcct();
                if($stateParams.userId && vm.authAcct.is_staff){
                    vm.studentLockerId = $stateParams.userId;                   
                } else {
                    vm.studentLockerId = vm.authAcct.id;
                    $state.transitionTo('app.student-locker', {userId: vm.studentLockerId}, { notify: false });
                };
                getUser(vm.studentLockerId);
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
