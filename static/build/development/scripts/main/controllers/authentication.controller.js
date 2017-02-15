(function(){
    'use strict';

    angular
        .module('main.controllers')
        .controller('AuthenticationController', AuthenticationController);

    AuthenticationController.$inject = ['$scope', '$sce', '$state', '$location', '$anchorScroll', 'Main', 'Users'];

    function AuthenticationController($scope, $sce, $state, $location, $anchorScroll, Main, Users){
        var vm = this;

        vm.dateReg = /^(?:19|20)[0-9]{2}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-9])|(?:(?!02)(?:0[1-9]|1[0-2])-(?:30))|(?:(?:0[13578]|1[02])-31))$/;

        function activate(){
            if(Main.isAuthAcct()){
                vm.authUser = Main.getAuthAcct();
                $state.go('app.dashboard', {'userId': vm.authUser.id});
            };
        };

        vm.goToSignup = function(){
            $('html, body').animate({
                scrollTop: $('#signup').offset().top
            }, 300);
        };

        vm.login = function(username, password){
            Main.login(username, password)
                .then(loginSuccess)
                .catch(loginError);
        };

        function loginSuccess(response){
            $state.go('app.dashboard', {'userId': response.id});
        };

        function loginError(errMsg){
            console.log(errMsg);
            vm.loginError = errMsg.data.message;
        };

        vm.register = function(newUser){
            if(newUser.password === newUser.confirm_password){
                Main.register(newUser)
                    .then(registerSuccess)
                    .catch(registerError);
            } else {
                vm.registerError = "Passwords must match!"
            };
        };

        function registerSuccess(response){

            $.notify({
                icon: "ti-check",
                message: "Account has been created! Pending activation from Pick+String Guitar Academy. You will receive an email upon activation."

            },{
                type: 'warning',
                timer: 1000,
                placement: {
                    from: 'top',
                    align: 'right',
                },
                template: '<div class="alert alert-{0} alert-with-icon" data-notify="container">'+
                '<button type="button" aria-hidden="true" class="close" data-notify="dismiss">×</button>'+
                '<span data-notify="icon"></span>'+
                '<span data-notify="message">{2}</span>'+
                '</div>'
            }); 
            $scope.isCollapsed = false;
            $scope.registerForm.$setPristine();
            vm.newUser = {};
            $state.go('login');
        };

        function registerError(errMsg){
            console.log(errMsg);
            if(errMsg.status === 500){
                vm.registerError = "username or email in use"
            } else {
                vm.registerError = errMsg.data.message;
            };
        };

        var mediaPath = media_path('');
        var staticPath = static_path('');

        $scope.path = { 
            static_files: $sce.trustAsResourceUrl(staticPath),
            media: $sce.trustAsResourceUrl(mediaPath),
        };

        activate();
    };
})();
