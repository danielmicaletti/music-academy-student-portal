(function(){
    'use strict';

    angular
        .module('main.directives')
        .directive('studentPlan', studentPlan);

    studentPlan.$inject = ['$sce', 'Users', 'Main', '$uibModal', 'Upload'];

    function studentPlan($sce, Users, Main, $uibModal, Upload) {

        var directive = {
            restrict: 'EA',
            scope: {
                tempType: '=',
                authAcct: '=',
                userId: '=',
                plans: '=',
                path: '='
            },
            link: function(scope, elem, attrs){

                scope.searchItem  = '';

                scope.$watch('plans', function(newValue, oldValue) {
                    if(newValue && !scope.authAcct.is_staff){
                        scope.setPlan(newValue);
                    }
                }); 

                function activate(){
                    if(scope.authAcct.is_staff){
                        Users.getAllPlans()
                            .then(function(response){
                                scope.allPlans = response;
                            });
                    } else {
                        if(scope.plans){
                            scope.setPlan(scope.plans);
                        };
                    };
                };

                scope.setPlan = function(studentPlan){
                    if(studentPlan){
                        var plan = studentPlan;
                    } else {
                        var plan = scope.selectedPlan;
                    };
                    if(plan.plan_section){
                        scope.sortedPlans = _.groupBy(plan.plan_section, 'section_week')
                    } else {
                        scope.sortedPlans = '';
                    };
                    scope.selectedPlan = plan;
                    scope.selectPlan = plan;
                    studentPlan = '';
                };

                scope.openPlan = function(selectedPlan, edit){
                    scope.curPlan = selectedPlan;
                    var schedulePlan = _.clone(selectedPlan);

                    var modalInstance = $uibModal.open({
                        templateUrl: $sce.trustAsResourceUrl(static_path('views/modals/student-plan.modal.html')),
                        controller: function($scope, $uibModalInstance){
                            var vm = this;

                            if(scope.authAcct.is_staff){
                                vm.authAcct = scope.authAcct;

                                Users.getAllSimpleUsers()
                                    .then(function(response){
                                        vm.allUsers = response;
                                    });
                            };

                            if(schedulePlan.id && edit){
                                vm.edit = true;
                                vm.modalTitle = "Update";
                                vm.plan = schedulePlan;
                            } else if(schedulePlan.id && !edit){
                                vm.edit = false;
                                vm.modalTitle = "";
                                vm.plan = schedulePlan;
                            } else {
                                vm.edit = true;
                                vm.modalTitle = "New";
                                vm.plan = {};
                            };

                            vm.closeModal = function(){
                                $uibModalInstance.dismiss('cancel');
                            };

                            vm.submitPlan = function(studentPlan){
                                scope.sendPlan(studentPlan);
                                $uibModalInstance.close();
                            };

                            vm.removePlan = function(plan){
                                scope.removePlan(plan);
                            }

                        },
                        controllerAs: 'vm',
                        size: 'lg',

                    });
                };

                scope.openSection = function(selectedSection, edit){
                    scope.selectedSection = selectedSection;
                    var schedulePlan = _.clone(selectedSection);

                    var modalInstance = $uibModal.open({
                        templateUrl: $sce.trustAsResourceUrl(static_path('views/modals/student-plan-section.modal.html')),
                        controller: function($scope, $uibModalInstance){
                            var vm = this;
                            vm.path = scope.path;
                            vm.selectedPlan = scope.selectedPlan;

                            vm.plan_files = scope.selectedSection.plan_section_file;

                            if(scope.authAcct.is_staff){
                                vm.authAcct = scope.authAcct;
                                vm.allPlans = scope.allPlans;
                            };

                            if(schedulePlan.id && edit){
                                vm.edit = true;
                                vm.modalTitle = "Update";
                                vm.plan = schedulePlan;
                            } else if(schedulePlan.id && !edit){
                                vm.edit = false;
                                vm.modalTitle = "";
                                vm.plan = schedulePlan;
                            } else {
                                vm.edit = true;
                                vm.modalTitle = "New";
                                vm.plan = {};
                            };

                            vm.closeModal = function(){
                                $uibModalInstance.dismiss('cancel');
                            };

                            vm.submitPlan = function(section){
                                scope.sendSection(section);
                                $uibModalInstance.close();
                            };

                            vm.removePlanFile = function(file){
                                scope.removePlanFile(file);
                            };

                        },
                        controllerAs: 'vm',
                        size: 'lg',

                    });
                };

                scope.sendPlan = function(newPlan){
                    if(newPlan.plan_student.length > 1 && newPlan.plan_student[0].id){
                        newPlan['plan_student'] = _.pluck(_.clone(newPlan.plan_student), 'id');
                    };

                    if(newPlan.id){
                        Users.updateStudentPlan(newPlan)
                            .then(sendPlanSuccess)
                            .catch(sendPlanError);
                    } else {
                        Users.createStudentPlan(newPlan)
                            .then(sendPlanSuccess)
                            .catch(sendPlanError);
                    };
                
                    function sendPlanSuccess(response){
                        if(!newPlan.id){
                            scope.allPlans.push(response);
                        };
        
                        scope.selectPlan = response;
                        scope.selectedPlan = response;
                        activate();
                    };

                    function sendPlanError(errMsg){
                        console.log(errMsg);
                    };
                };

                scope.sendSection = function(newSection){
                    newSection['student_plan'] = scope.selectedPlan.id;

                    if(newSection.id){
                        var section_url = 'api/v1/student-plan-section/'+newSection.id+'/';
                        var section_method = 'PUT';
                    } else {
                        var section_url = 'api/v1/student-plan-section/';
                        var section_method = 'POST';                        
                    };

                    Upload.upload({
                        url: section_url,
                        data: newSection,
                        method: section_method,
                    })
                    .then(function(response){

                        if(newSection.id){
                            var i = scope.selectedPlan.plan_section.indexOf(scope.selectedSection);
                            scope.selectedPlan.plan_section[i] = response.data;
                            scope.setPlan(scope.selectedPlan);
                        } else {
                            scope.selectedPlan.plan_section.push(response.data);
                            scope.setPlan(scope.selectedPlan);
                        }
                    }, function(response){
                        console.log('Error status: ' + response.status);
                    }, function(evt){
                        var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                        scope.fileProgress = progressPercentage;
                    });
                };

                scope.removePlanSection = function(section){
                    Users.deleteStudentPlanSection(section)
                        .then(function(response){
                            var index = scope.selectedPlan.plan_section.indexOf(section);
                            scope.selectedPlan.plan_section.splice(index, 1);
                            scope.setPlan(scope.selectedPlan);
                        })
                        .catch(function(errMsg){
                            console.log(errMsg);
                        });
                };

                scope.removePlanFile = function(file){
                    Users.deleteStudentPlanFile(file)
                        .then(function(response){
                            var index = scope.selectedSection.plan_section_file.indexOf(file);
                            scope.selectedSection.plan_section_file.splice(index, 1); 
                        })
                        .catch(function(errMsg){
                            console.log(errMsg);
                        });
                };

                scope.removePlan = function(plan){
                    Users.deleteStudentPlan(plan)
                        .then(function(response){
                            activate();
                            scope.selectPlan = '';
                            scope.selectedPlan = '';
                        })
                        .catch(function(errMsg){
                            console.log(errMsg);
                        });
                };

                activate();          
            },
            templateUrl: function(elem,attrs) {
                return $sce.trustAsResourceUrl(static_path('views/directives/student-plan-'+attrs.tempType+'.directive.html'));
            }

        }
        return directive;
    }
})();