(function(){
    'use strict';

    angular
        .module('schedule.controllers')
        .controller('ScheduleController', ScheduleController);

    ScheduleController.$inject = ['$scope', '$sce', '$state', 'Main', 'Users', 'Schedule', '$uibModal', 'moment', 'calendarConfig'];

    function ScheduleController($scope, $sce, $state, Main, Users, Schedule, $uibModal, moment, calendarConfig){
        var vm = this;

        vm.isCollapsed = true;
        vm.schedAvail = false;
        vm.courseAvail = false;
        vm.userSchedule = [];

        function activate(){

            if(Main.isAuthAcct()){
                vm.authAcct = Main.getAuthAcct();
                Users.getUser(vm.authAcct.id).then(function(response){
                    vm.user = response;
                    Schedule.getAllCourses()
                        .then(getAllCoursesSuccess)
                        .catch(getAllCoursesError);

                    Schedule.getSchedule()
                        .then(getScheduleSuccess)
                        .catch(getScheduleError);
                }).catch(function(errMsg){
                    Main.logout();
                });
            } else {
                console.log("Could not get account");
            };
            
            if(vm.authAcct.is_admin){
                calendarConfig.showTimesOnWeekView = true;
                calendarConfig.displayEventEndTimes = true;  
                vm.calendarView = 'month';            
            };

            vm.calendarDate = new Date();
            setWeek();
        };

        function getAllCoursesSuccess(response){
            vm.courses = response;
            vm.courseAvail = true;
            vm.getCourses(vm.courses); 
        };

        function getAllCoursesError(errMsg){
            console.log(errMsg);
        };

        function getScheduleSuccess(response){
            vm.schedule = response;
            vm.schedAvail = true;
            if(vm.user.is_admin){
                vm.setSchedule(response);
            };
        };

        function getScheduleError(errMsg){
            console.log(errMsg);
        };

        vm.getCourses = function(courses){
            vm.availCourses = [];
            angular.forEach(courses, function(v,k){
                for(var i = 0; i < 7; i++){
                    var day = moment(vm.calendarDate).add(i, 'd').format("dddd").toLowerCase();
                    var dateStr = moment(vm.calendarDate).add(i, 'd').format("YYYY-MM-DD")
                    if(_.propertyOf(v)(day) == true && vm.checkStudent(vm.user, v)){
                        if(v.course_location){
                            var location = v.course_location.name;
                        }else{
                            var location = 'no location set';
                        };
                        vm.availCourses.push({
                            day: day,
                            date: moment(vm.calendarDate).add(i, 'd').toDate(),
                            start: moment(dateStr+"T"+v.course_start_time).toDate(),
                            end: moment(dateStr+"T"+v.course_end_time).toDate(),
                            course: v
                        });
                        vm.userSchedule.push({
                            title: v.course_title+" - "+location,
                            type: 'info',
                            startsAt: moment(dateStr+"T"+v.course_start_time).toDate(),
                            endsAt: moment(dateStr+"T"+v.course_end_time).toDate(),
                            editable: true,
                            deletable: true,
                            draggable: false,
                            resizable: false, 
                            incrementsBadgeTotal: true,
                            course: v,
                        });
                    };
                };               
            });
        };

        vm.checkStudent = function(user, course){
            if(vm.user.is_admin){
                return true;
            } else {
                var rank = user.play_level_display.toLowerCase();
                var age = moment().diff(moment(user.date_of_birth, 'YYYYMMDD'), 'years');
                if(user.student_log.length > 0){
                    var pracTime = _.pluck(user.student_log, 'practice_time');
                    var sumTimes = pracTime.reduce(function(a, b) { return parseInt(a) + parseInt(b); });

                } else {
                    var sumTimes = 0;
                };
                if(_.propertyOf(course)(rank) && (age >= course.course_age_min && age <= course.course_age_max) && (sumTimes >= parseInt(course.practice_min))){
                    return true;
                } else {
                    return false;
                };
            };
        };

        function setWeek(){
            vm.week = [];
            for(var i = 0; i < 7; i++){
                var day = moment(vm.calendarDate).add(i, 'd').format("dddd").toLowerCase();
              
                vm.week.push({
                    day: day,
                    date: moment(vm.calendarDate).add(i, 'd').toDate()
                });
            };
        };

        vm.setSchedule = function(schedule){
            angular.forEach(schedule, function(v,k){
                if(v.course.course_location){
                    var location = v.course.course_location.name;
                }else{
                    var location = 'no location set';
                };
                var studentCourse = {
                    title: v.course.course_title+" - "+location,
                    type: 'success',
                    startsAt: moment(v.schedule_date+"T"+v.schedule_start_time).toDate(),
                    endsAt: moment(v.schedule_date+"T"+v.schedule_end_time).toDate(),
                    editable: true,
                    deletable: true,
                    draggable: false,
                    resizable: false, 
                    incrementsBadgeTotal: true,
                    schedule: v,
                };
                vm.userSchedule.push(studentCourse);
            });
        };

        vm.addCourse = function(newClass){
            Schedule.addCourse(newClass)
                .then(addCourseSuccess)
                .catch(addCourseError);
        };

        function addCourseSuccess(response){
            activate();
        };

        function addCourseError(errMsg){
            console.log(errMsg);
        };

        vm.removeCourse = function(course){
            Schedule.removeCourse(course)
                .then(removeCourseSuccess)
                .catch(removeCourseError);
        };

        function removeCourseSuccess(response){
            activate();
        };

        function removeCourseError(errMsg){
            console.log(errMsg);
        };

        vm.checkDate = function(date, scheduleDate){
            var calDate = moment(date).format('YYYY-MM-DD');
            var schedDate = moment(scheduleDate).format('YYYY-MM-DD');
            if(calDate === schedDate){
                return true;
            } else {
                return false;
            };
        };

        vm.isDay = function(courseDate){
            if(moment(courseDate) < moment(vm.calendarDate).add(10, 'm')){
                return false; 
            } else {
                return true;
            };
        };

        vm.checkMax = function(course){
            angular.forEach(vm.schedule, function(v,k){
                var courseDate = moment(course.date).format("YYYY-MM-DD");
                if((course.course.id == v.course.id) && (moment(courseDate+"T"+course.course.course_start_time).toDate() == moment(v.schedule_date+"T"+v.schedule_start_time).toDate())){
                    if(parseInt(course.course.max_student) > parseInt(v.student.length)){
                        return true;
                    } else {
                        return false;
                    };
                };
            });
        };

        vm.getTime = function(time){
            return moment("1999-12-12T"+time).format("h:mm a");
        };

        vm.eventClicked = function(calendarEvent){
            if(calendarEvent.course){
                var calCourse = calendarEvent.course;
                var cT = 'new';
                var sC = '';
            } else if(calendarEvent.schedule){
                var calCourse = calendarEvent.schedule.course;
                var cT = 'sched';
                var sC = calendarEvent.schedule;
            };
            vm.open({
                    'date': calendarEvent.startsAt, 
                    'courseStart': moment(calendarEvent.startsAt).format("h:mm a"), 
                    'courseEnd': moment(calendarEvent.endsAt).format("h:mm a")
                },
                calCourse, 
                vm.user, 
                {
                    'courseType': cT, 
                    'scheduledCourse': sC
            });
        };

        vm.open = function(date, course, user, schedType){
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: $sce.trustAsResourceUrl(static_path('views/modals/add-course.modal.html')),
                controller: 'AddCourseController',
                controllerAs: 'vm',
                size: 'lg',
                resolve: {
                    date: date,
                    course: course,
                    user: user,
                    schedType: schedType,
                }
            });

            modalInstance.result.then(function(newCourse){
                if(newCourse.schedule){
                    vm.removeCourse(newCourse);
                } else {
                    vm.addCourse(newCourse);  
                };
            });
        };
        
        activate();
    };
})();
