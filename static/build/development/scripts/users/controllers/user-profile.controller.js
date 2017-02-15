(function(){
    'use strict';

    angular
        .module('main.controllers')
        .controller('UserProfileController', UserProfileController);

    UserProfileController.$inject = ['$scope', '$state', '$stateParams', 'Main', 'Users', 'Upload'];

    function UserProfileController($scope, $state, $stateParams, Main, Users, Upload){
        var vm = this;

        vm.dateReg = /^(?:19|20)[0-9]{2}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-9])|(?:(?!02)(?:0[1-9]|1[0-2])-(?:30))|(?:(?:0[13578]|1[02])-31))$/;

        function activate(){
            if(Main.isAuthAcct()){
                vm.authAcct = Main.getAuthAcct();
                if($stateParams.userId && vm.authAcct.is_staff){
                    vm.profId = $stateParams.userId;
                    Users.getLocations()
                        .then(function(response){
                            vm.locations = response;
                        });                 
                } else {
                    vm.profId = vm.authAcct.id;
                    $state.transitionTo('app.profile', {userId: vm.profId}, { notify: false });
                };
                getUser(vm.profId);
            } else {
                $state.go('app.dashboard');
            };
        };

        function getUser(id){
            Users.getUser(id)
                .then(getUserSuccess)
                .catch(getUserError);
        };

        vm.updateProfile = function(user){
            Upload.upload({
                url: 'api/v1/users/'+user.id+'/',
                data: user,
                method: 'PUT',
                headers: {'Authorization': 'JWT '+vm.authAcct.token},
            })
            .then(function(response){
                getUserSuccess(response.data);
                $scope.userProfileForm.$setPristine();
                $scope.$emit('update_user_info', response.data);
            }, function(response){
                console.log('Error status: ' + response.status);
            }, function(evt){
                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                vm.fileProgress = progressPercentage;});
        };

        function getUserSuccess(response){
            vm.respUser = response;
            var userCopy = angular.copy(vm.respUser)
            vm.user = _.omit(userCopy, 'student_goal', 'student_log', 'student_material', 'student_wishlist', 'student_objective');
        };

        function getUserError(errMsg){
            console.log(errMsg);
            Main.logout();
        };

        vm.clearChanges = function(){
            vm.user = {};
            vm.user = angular.copy(vm.respUser);
        };

        vm.deleteNote = function(note){
            Users.deleteStudentNote(note.id)
                .then(function(response){
                    var index = vm.user.student_note.indexOf(note);
                    vm.user.student_note.splice(index, 1);
                }).catch(function(errMsg){
                    console.log(errMsg);
                });
        };

        activate();
    };
})();
