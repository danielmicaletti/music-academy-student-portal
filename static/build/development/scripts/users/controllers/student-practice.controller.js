(function(){
    'use strict';

    angular
        .module('main.controllers')
        .controller('StudentPracticeController', StudentPracticeController);

    StudentPracticeController.$inject = ['$scope', '$state', '$stateParams', 'Main', 'Users'];

    function StudentPracticeController($scope, $state, $stateParams, Main, Users){
        var vm = this;

        function activate(){
            if(Main.isAuthAcct()){
                vm.authAcct = Main.getAuthAcct();
                if($stateParams.userId && vm.authAcct.is_staff){
                    vm.dashId = $stateParams.userId;                   
                } else {
                    vm.dashId = vm.authAcct.id;
                    $state.transitionTo('app.student-practice', {userId: vm.dashId}, { notify: false });
                };
                getUser(vm.dashId);
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
