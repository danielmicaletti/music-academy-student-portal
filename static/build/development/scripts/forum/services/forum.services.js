(function(){
    'use strict';

    angular
        .module('forum.services')
        .factory('Forum', Forum);

    Forum.$inject = ['$http', '$q', '$state', '$cookies'];

    function Forum($http, $q, $state, $cookies){
        var vm = this;

        vm.acct = $cookies.getObject('authAcct');

        var Forum = {
            getAllTopics: getAllTopics,
            getAllCategories: getAllCategories,
            getAllMessages: getAllMessages,
            addNewMessage: addNewMessage,
            addNewTopic: addNewTopic,

        };

        return Forum;

        function generalCallbackSuccess(response){
            return response.data;
        };

        function generalCallbackError(response){
            return $q.reject('Error '+response.status+'');
        };

        function getAllTopics(){  
            return $http.get('api/v1/forum-topics/')
                .then(generalCallbackSuccess)
                .catch(generalCallbackError);
        };

        function getAllCategories(){
            return $http.get('api/v1/forum-category/')
                .then(generalCallbackSuccess)
                .catch(generalCallbackError);
        };

        function getAllMessages(topicId){
            return $http.get('api/v1/forum-topics/'+topicId+'/', topicId)
                .then(generalCallbackSuccess)
                .catch(generalCallbackError);
        };

        function addNewMessage(message){
            return $http.post('api/v1/forum-message/', message)
                .then(generalCallbackSuccess)
                .catch(generalCallbackError);
        };

        function addNewTopic(topic){
            return $http.post('api/v1/forum-topics/', topic)
                .then(generalCallbackSuccess)
                .catch(generalCallbackError);
        };
    };
})();
