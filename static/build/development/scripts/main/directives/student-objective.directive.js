(function(){
    'use strict';

    angular
        .module('main.directives')
        .directive('studentObjective', studentObjective);

    studentObjective.$inject = ['$sce', 'Users', '$uibModal'];

    function studentObjective($sce, Users, $uibModal) {

        var directive = {
            restrict: 'EA',
            scope: {
                tempType: '=',
                userId: '=',
                authAcct: '=',
                objectives: '=',
            },
            link: function(scope, elem, attrs){
                
                scope.sortType     = ['objective_complete', 'objective_created']; 
                scope.sortReverse  = false;
                scope.searchItem   = ''; 

                scope.open = function(objective){

                    var modalInstance = $uibModal.open({
                        templateUrl: $sce.trustAsResourceUrl(static_path('views/modals/student-objective.modal.html')),
                        controller: function($scope, $uibModalInstance){
                            var vm = this;
                            if(objective.id){
                                vm.modalTitle = "Update Practice Item";
                                vm.studentObjective = objective;    
                            } else {
                                vm.modalTitle = "New Practice Item";
                                vm.studentObjective = {};                                 
                            };
                            
                            vm.closeModal = function (){
                                $uibModalInstance.dismiss('cancel');
                            };

                            vm.submitObjective = function(studentObjective){

                                if(objective.id){
                                    scope.updateObjective(studentObjective);  
                                } else {
                                    var userId = scope.userId;
                                    scope.addObjective(userId, studentObjective); 
                                }
                                $uibModalInstance.close();
                            }
                        },
                        controllerAs: 'vm',
                        size: 'lg',
                    });
                }
                
                scope.updateObjective = function(updObjective){
                    var objectiveId = updObjective.id;
                    if(updObjective.objective){
                        var tempObj = {
                            id: updObjective.id, 
                            objective: updObjective.objective,
                            objective_complete: updObjective.objective_complete,
                            objective_notes: updObjective.objective_notes,
                            objective_priority: updObjective.objective_priority,
                            objective_visible: updObjective.objective_visible
                        };
                    } else {
                        var tempObj = updObjective;
                        var curDate = scope.getDate();
                        tempObj['objective_complete_date'] = curDate.now;
                    };

                    Users.updateStudentObjective(objectiveId, tempObj)
                        .then(function(response){
                            var index = scope.objectives.indexOf(updObjective);
                            scope.objectives[index] = response;
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

                scope.addObjective = function(userId, objective){
                    objective['student'] = userId;
                    Users.createStudentObjective(objective)
                        .then(function(response){
                            scope.objectives.push(response);
                        }).catch(function(errorMsg){
                            console.log(errorMsg);
                        });
                };

                scope.deleteObjective = function(objective){
                    var objectiveId = objective.id;
                    Users.deleteStudentObjective(objectiveId)
                        .then(function(response){
                            var index = scope.objectives.indexOf(objective);
                            scope.objectives.splice(index, 1);
                        }).catch(function(errorMsg){
                            console.log(errorMsg);
                        });
                };
            },
            templateUrl: function(elem,attrs) {
                return $sce.trustAsResourceUrl(static_path('views/directives/student-objective-'+attrs.tempType+'.directive.html'));
            }
        }
        return directive;
    }
})();