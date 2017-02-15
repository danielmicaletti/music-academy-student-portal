(function(){
    'use strict';

    angular
        .module('main.directives')
        .directive('studentPracticeLog', studentPracticeLog);

    studentPracticeLog.$inject = ['$sce', 'Users', '$uibModal', '$timeout'];

    function studentPracticeLog($sce, Users, $uibModal, $timeout) {

        var directive = {
            restrict: 'EA',
            scope: {
                tempType: '=',
                userId: '=',
                practiceLogs: '=',
            },
            link: function(scope, elem, attrs){
                
                scope.sortType     = ['practice_item_created']; 
                scope.sortReverse  = false;
                scope.searchItem   = ''; 

                scope.open = function(practiceLog){

                    var modalInstance = $uibModal.open({
                        templateUrl: $sce.trustAsResourceUrl(static_path('views/modals/student-practice.modal.html')),
                        controller: function($scope, $uibModalInstance, $timeout){
                            var vm = this;
                            if(practiceLog.id){
                                vm.modalTitle = "Update Practice";
                                vm.newPracticeLog = practiceLog;    
                            } else {
                                vm.modalTitle = "New Practice";
                                vm.newPracticeLog = {};                                 
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

                            vm.closeModal = function(){
                                $uibModalInstance.dismiss('cancel');
                            };

                            vm.submitNewPracticeLog = function(newPracticeLog){

                                if(practiceLog.id){
                                    scope.updatePracticeLog(newPracticeLog);  
                                } else {
                                    var userId = scope.userId;
                                    scope.addPracticeLog(userId, newPracticeLog); 
                                }
                                $uibModalInstance.close();
                            };
                        },
                        controllerAs: 'vm',
                        size: 'lg',
                    });
                };

                scope.updatePracticeLog = function(practiceLog){
                    var practLog = _.omit(practiceLog, 'practice_item_created');
                    Users.updateStudentPracticeLog(practLog)
                        .then(function(response){
                            scope.pracLog = _.findWhere(scope.practiceLogs, {id: practiceLog.id});
                            scope.pracLog['practice_category_display'] = response.practice_category_display;
                            scope.getStats();
                        }).catch(function(errorMsg){
                            console.log(errorMsg);
                        });
                };

                scope.addPracticeLog = function(userId, practiceLog){
                    practiceLog['student'] = userId;
                    Users.createStudentPracticeLog(practiceLog)
                        .then(function(response){
                            scope.practiceLogs.push(response);
                            scope.getStats();
                        }).catch(function(errorMsg){
                            console.log(errorMsg);
                        });
                }; 

                scope.deletePracticeLog = function(practiceLog){
                    var practiceLogId = practiceLog.id;
                    Users.deleteStudentPracticeLog(practiceLogId)
                        .then(function(response){
                            var index = scope.practiceLogs.indexOf(practiceLog);
                            scope.practiceLogs.splice(index, 1);
                            scope.getStats();
                        }).catch(function(errorMsg){
                            console.log(errorMsg);
                        });
                }; 

                scope.getStats = function(){
                    $timeout(function(){
                        var times = [];
                        var speeds = [];
                        scope.maxSpeed = 0;
                        if(scope.practiceLogs.length){
                            angular.forEach(scope.practiceLogs, function(v,k){
                                if(v.practice_time){
                                    var time = parseInt(v.practice_time);
                                    times.push(time);
                                };
                                if(v.practice_speed){
                                    var speed = parseInt(v.practice_speed);
                                    if(speed > scope.maxSpeed){
                                        scope.maxSpeed = speed;
                                    };
                                    speeds.push(speed);
                                };
                            });                            
                        } else {
                            times.push(0);
                            speeds.push(0);
                        };

                        scope.sumTimes = times.reduce(function(a, b) { return a + b; });
                        scope.sumSpeeds = speeds.reduce(function(a, b) { return a + b; });
                    }, 1000);                    
                };
                scope.getStats();

            },
            templateUrl: function(elem,attrs) {
                return $sce.trustAsResourceUrl(static_path('views/directives/student-practice-'+attrs.tempType+'.directive.html'));
            }
        };
        return directive;
    };
})();