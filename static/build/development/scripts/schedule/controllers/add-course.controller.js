(function(){
    'use strict';

    angular
        .module('schedule.controllers')
        .controller('AddCourseController', AddCourseController);

    AddCourseController.$inject = ['$scope', '$sce', 'Main', 'Users', 'Schedule', '$uibModalInstance', 'moment', 'date', 'course', 'user', 'schedType'];

    function AddCourseController($scope, $sce, Main, Users, Schedule, $uibModalInstance, moment, date, course, user, schedType){
        var vm = this;

        vm.date = date;
        vm.course = course;
        vm.user = user;
        vm.schedType = schedType
        vm.courseType = schedType.courseType;

        function activate(){
            if(parseInt(vm.user.user_credit) < parseInt(vm.course.course_credit)){
                vm.needCredit = true;
            } else {
                vm.needCredit = false;
            };

            vm.newClass = {
                course_id: course.id,
                student_id: user.id,
                schedule_date: moment(date.date).format('YYYY-MM-DD'),
                schedule_start_time: course.course_start_time,
                schedule_end_time: course.course_end_time,
                recurring: false,
            };

            if(vm.courseType == 'sched' && _.contains(vm.schedType.scheduledCourse.schedule_recurring_user, vm.user.id)){
                vm.newClass.recurring = true;
            };
        
        };

        vm.getTime = function(time){
            if(time.length < 10){
                return moment("1999-12-12 "+time, "YYYY-MM-DD h:mm a").toDate();
            } else {
                return time;
            };
        };

		vm.addClass = function(){
            if(vm.courseType == 'sched'){
                vm.newClass['schedule'] = vm.schedType.scheduledCourse.id;
            };
			$uibModalInstance.close(vm.newClass, vm.courseType);
		};

		vm.closeModal = function(){
			$uibModalInstance.dismiss('cancel');
		};

        activate();
    };
})();
