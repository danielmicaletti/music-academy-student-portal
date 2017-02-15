(function(){
    'use strict';

    angular
        .module('schedule.services')
        .factory('Schedule', Schedule);

    Schedule.$inject = ['$http', '$q', '$state', '$cookies'];

    function Schedule($http, $q, $state, $cookies){
        var vm = this;

        vm.acct = $cookies.getObject('authAcct');

        var Schedule = {
            getAllCourses: getAllCourses,
            getSchedule: getSchedule,
            addCourse: addCourse,
            removeCourse: removeCourse,
        };

        return Schedule;

        function generalCallbackSuccess(response){
            return response.data;
        };

        function generalCallbackError(response){
            return $q.reject('Error '+response.status+'');
        };

        function getAllCourses(){
            return $http.get('api/v1/courses/')
                .then(generalCallbackSuccess)
                .catch(generalCallbackError);
        };

        function getSchedule(){
            return $http.get('api/v1/course-schedule/')
                .then(generalCallbackSuccess)
                .catch(generalCallbackError);
        };

        function addCourse(course){
            return $http.post('api/v1/course-schedule/', course)
                .then(generalCallbackSuccess)
                .catch(generalCallbackError);
        };

        function removeCourse(course){
            return $http.put('api/v1/course-schedule-remove/'+course.schedule+'/', course)
                .then(generalCallbackSuccess)
                .catch(generalCallbackError);
        };
    };
})();
