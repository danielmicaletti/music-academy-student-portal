(function(){
    'use strict';

    angular
        .module('forum.controllers')
        .controller('ForumController', ForumController);

    ForumController.$inject = ['$scope', '$sce', '$state', 'Main', 'Forum', 'Users'];

    function ForumController($scope, $sce, $state, Main, Forum, Users){
        var vm = this;

        vm.discussionClass = '';

        activate();

        function activate(){
            if(Main.isAuthAcct()){
                var authAcct = Main.getAuthAcct();
                Users.getUser(authAcct.id).then(function(response){
                    vm.user = response;
                }).catch(function(errMsg){
                    Main.logout();
                });
                
                Forum.getAllCategories()
                    .then(getAllCategoriesSuccess)
                    .catch(getAllCategoriesError);
            } else {
                console.log("Could not get account");
            };

        };

        function getAllCategoriesSuccess(response){
            vm.categories = response;
        };

        function getAllCategoriesError(errMsg){
            console.log(errMsg);
        };

        vm.setCategory = function(category){
            
            vm.discussionClass = "animate fadeOutDown"
            vm.category = category;
            vm.discussionClass = "animate fadeInDown"
        };
    };
})();
