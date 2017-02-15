(function(){
    'use strict';

    angular
        .module('forum.directives')
        .directive('forumDiscussion', forumDiscussion);

    forumDiscussion.$inject = ['$sce', '$cookies', 'Users', 'Forum', '$uibModal', 'Upload'];

    function forumDiscussion($sce, $cookies, Users, Forum, $uibModal, Upload) {

        var directive = {
            restrict: 'EA',
            scope: {
                category: '=',
                userId: '=',
                path: '=',
                playLevelColor: '=',
                discussionClass: '='

            },
            link: function(scope, elem, attrs){

                scope.newMessage = {};

                scope.authAcct = $cookies.getObject('authAcct');

                scope.open = function(objective){

                    var modalInstance = $uibModal.open({
                        templateUrl: $sce.trustAsResourceUrl(static_path('views/modals/forum-topic.modal.html')),
                        controller: function($scope, $uibModalInstance, $timeout){
                            var vm = this;
                            
                            vm.closeModal = function(){
                                $uibModalInstance.dismiss('cancel');
                            };

                            vm.addNewTopic = function(newTopic){
                                scope.addTopic(newTopic);
                                $uibModalInstance.close();
                            };
                        },
                        controllerAs: 'vm',
                        size: 'lg',
                    });
                };

                scope.addTopic = function(newTopic){
                    newTopic['category_id'] = scope.category.id;
                    Forum.addNewTopic(newTopic)
                        .then(addTopicSuccess)
                        .catch(addTopicError);
                    
                };

                function addTopicSuccess(response){
                    scope.category.category_topic.push(response);
                    scope.getMessages(response.id);

                };

                function addTopicError(errMsg){
                    console.log(errMsg);
                };

                scope.getMessages = function(topicId){
                    scope.messageClass = "animated fadeOutLeft";
                    Forum.getAllMessages(topicId)
                        .then(getAllMessagesSuccess)
                        .catch(getAllMessagesError);
                };

                function getAllMessagesSuccess(response){
                    scope.messages = response;
                    scope.messageClass = "animated fadeInRight";
                };

                function getAllMessagesError(errMsg){
                    console.log(errMsg);
                };

                scope.addMessage = function(newMessage, msgId){
                    var msg = {
                        message: newMessage.message, 
                        topic_id: msgId,
                        message_file: newMessage.message_file
                    };

                    Upload.upload({
                        url: 'api/v1/forum-message/',
                        data: msg,
                    })
                    .then(function(response){
                        scope.newMessage = {};
                        scope.messages.topic_message.push(response.data);
                    }, function(response){
                        console.log('Error status: ' + response.status);
                    }, function(evt){
                        var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                        scope.fileProgress = progressPercentage;
                        console.log('progress: ' + progressPercentage + '% ' + evt.config.data.message_file.name);
                    });
                };

                function addNewMessageSuccess(response){
                    scope.newMessage = {};
                    scope.messages.topic_message.push(response);
                };

                function addNewMessageError(errMsg){
                    console.log(errMsg);
                };

                scope.$watch('category', function(newVal){
                    if(newVal){
                        scope.messages = '';
                    }
                }, true);

            },
            templateUrl: $sce.trustAsResourceUrl(static_path('views/directives/forum-discussion.directive.html')),

        }
        return directive;
    }
})();