(function(){
    'use strict';

    angular
        .module('main.directives')
        .directive('studentGoal', studentGoal);

    studentGoal.$inject = ['$sce', 'Users', 'Main', '$uibModal', '$timeout', '$cookies'];

    function studentGoal($sce, Users, Main, $uibModal, $timeout, $cookies) {

        var directive = {
            restrict: 'EA',
            scope: {
                tempType: '=',
                userId: '=',
                goals: '='
            },
            link: function(scope, elem, attrs){

                scope.sortType     = ['goal_complete', 'goal_target_date']; 
                scope.sortReverse  = false;
                scope.searchItem   = '';   

                scope.open = function(goal){

                    var modalInstance = $uibModal.open({
                        templateUrl: $sce.trustAsResourceUrl(static_path('views/modals/student-goal.modal.html')),
                        controller: function($scope, $uibModalInstance, $timeout){
                            var vm = this;
                            if(goal.id){
                                vm.modalTitle = "Update Goal";
                                vm.studentGoal = goal;    
                            } else {
                                vm.modalTitle = "New Goal";
                                vm.studentGoal = {};                                 
                            };
                            
                            vm.openDate = function($event){
                                $event.preventDefault();
                                $event.stopPropagation();
                                $timeout(function () {
                                    vm.showPicker.opened = !vm.showPicker.opened;
                                });
                            };

                            vm.showPicker = {
                                opened: false,
                            };

                            vm.closeModal = function (){
                                $uibModalInstance.dismiss('cancel');
                            };

                            vm.submitGoal = function(studentGoal){

                                if(goal.id){
                                    scope.updateGoal(studentGoal);  
                                } else {
                                    var userId = scope.userId;
                                    scope.addGoal(userId, studentGoal); 
                                };
                                $uibModalInstance.close();
                            };

                        },
                        controllerAs: 'vm',
                        size: 'lg',

                    });
                };

                scope.updateGoal = function(updGoal){
                    var goalId = updGoal.id;
                    if(updGoal.goal){
                        var tempGoal = {
                            id: updGoal.id, 
                            goal: updGoal.goal,
                            goal_target_date: updGoal.goal_target_date,
                            goal_complete: updGoal.goal_complete,
                            goal_notes: updGoal.goal_notes,
                        };
                    } else {
                        var tempGoal = updGoal;
                        var curDate = scope.getDate();
                        tempGoal['goal_complete_date'] = curDate.now;

                    };
                    Users.updateStudentGoal(goalId, tempGoal)
                        .then(function(response){
                            var index = scope.goals.indexOf(updGoal);
                            scope.goals[index] = response;
                        }).catch(function(errorMsg){
                            console.log(errorMsg);
                        });
                };

                scope.getDate = function(){
                        var today = new Date(); 
                        var dd = today.getDate(); 
                        var mm = today.getMonth()+1; 
                        var yyyy = today.getFullYear(); 
                        var hh = today.getHours(); 
                        var m = today.getMinutes(); 
                        var secs = today.getSeconds(); 
                        var now = yyyy+"-"+mm+"-"+dd+"T"+hh+":"+m+":"+secs;
                        return {today:today, dd:dd, mm:mm, yyyy:yyyy, hh:hh, m:m, secs:secs, now:now};
                };

                scope.addGoal = function(userId, goal){
                    goal['student'] = userId;
                    Users.createStudentGoal(goal)
                        .then(function(response){
                            scope.goals.push(response);
                        }).catch(function(errorMsg){
                            console.log(errorMsg);
                        });
                };

                scope.deleteGoal = function(goal){
                    var goalId = goal.id;
                    Users.deleteStudentGoal(goalId)
                        .then(function(response){
                            var index = scope.goals.indexOf(goal);
                            scope.goals.splice(index, 1);
                        }).catch(function(errorMsg){
                            console.log(errorMsg);
                        });
                };

                scope.checkGoals = function(){
                    scope.$watch('goals', function(newVal) {
                        if(newVal){ 
                            var today = new Date();
                            var tomorrow = new Date();
                            tomorrow.setDate(tomorrow.getDate()+7);
                            var authAcctNot = Main.getAuthAcct();
                            if(authAcctNot.notification.goal){
                                var needNot = false;
                                if(authAcctNot.notification.goal_time>tomorrow){
                                    var needNot = true;
                                };
                            };
                            if(needNot || !authAcctNot.notification.goal){
                                var minDate;
                                angular.forEach(newVal, function(v,k){
                                    if(v.goal_target_date&&!v.goal_complete){
                                        if(!minDate){
                                            minDate = v.goal_target_date;
                                        } else if(v.goal_target_date < minDate){
                                            minDate = v.goal_target_date;
                                        };
                                    };
                                });
                                if(minDate){
                                    var warn = new Date();
                                    warn.setDate(warn.getDate()+7);
                                    var md = new Date(minDate);
                                    if(today > md){
                                        $.notify({
                                            icon: "ti-medall",
                                            message: "You have Goals that are past the Target Date!"

                                        },{
                                            type: 'danger',
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
                                    } else if(warn > md){

                                        $.notify({
                                            icon: "ti-medall",
                                            message: "You have Goals that are approaching Target Date!"

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
                                    };
                                    authAcctNot['notification'] = {'goal': true, 'goal_time': today};
                                    $cookies.putObject('authAcct', authAcctNot);
                                };
                            };
                        };
                    }, true);
                };
                scope.checkGoals();             
            },
            templateUrl: function(elem,attrs){
                return $sce.trustAsResourceUrl(static_path('views/directives/student-goal-'+attrs.tempType+'.directive.html'));
            }

        }
        return directive;
    }
})();