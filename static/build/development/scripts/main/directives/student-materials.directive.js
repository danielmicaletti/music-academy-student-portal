(function(){
    'use strict';

    angular
        .module('main.directives')
        .directive('studentMaterials', studentMaterials);

    studentMaterials.$inject = ['$sce', '$cookies', 'Users', '$uibModal', 'Upload'];

    function studentMaterials($sce, $cookies, Users, $uibModal, Upload) {

        var directive = {
            restrict: 'EA',
            scope: {
                tempType: '=',
                userId: '=',
                materials: '=',
                path: '=',
            },
            link: function(scope, elem, attrs){
                scope.sortType     = ['-material_added']; 
                scope.sortReverse  = false;
                scope.searchItem   = '';

                scope.authAcct = $cookies.getObject('authAcct');

                scope.open = function(material){

                    var modalInstance = $uibModal.open({
                        templateUrl: $sce.trustAsResourceUrl(static_path('views/modals/student-materials.modal.html')),
                        controller: function($scope, $uibModalInstance, $timeout){
                            var vm = this;
                            vm.path = scope.path;
                            vm.authAcct = scope.authAcct;
                            vm.hasGroup = false;
                            vm.fileProgress = scope.fileProgress;

                            if(material.id){
                                vm.modalTitle = "Update Material";
                                vm.newMaterial = material; 
                                if(material.student_group.length){
                                    vm.hasGroup = true;
                                    scope.hasGroup = vm.hasGroup;
                                }; 
                            } else {
                                vm.modalTitle = "Add Material";
                                vm.newMaterial = {};                                 
                            };

                            if(scope.authAcct.is_staff){
                                Users.getAllSimpleUsers()
                                    .then(function(response){
                                        vm.allUsers = response;
                                    });
                            };

                            vm.closeModal = function (){
                                $uibModalInstance.dismiss('cancel');
                            };

                            vm.submitMaterial = function(newMaterial){
                                if(newMaterial.student_group){
                                    var group = true;
                                    if(newMaterial.student_group.length > 1 && newMaterial.student_group[0].email){
                                        newMaterial['group_student'] = _.pluck(_.clone(newMaterial.student_group), 'id');
                                    } else {
                                        newMaterial['group_student'] = _.clone(newMaterial.student_group);
                                    };       
                                    newMaterial = _.omit(newMaterial, 'student_group');
                                };

                                if(material.id){
                                    scope.updateMaterial(newMaterial);  
                                } else {
                                    if(!group){
                                        newMaterial['student'] = scope.userId;
                                    } else {
                                        newMaterial['student'] = scope.authAcct.id;
                                    };
                                    scope.addMaterial(newMaterial); 
                                };
                                $uibModalInstance.close();
                            };
                        },
                        controllerAs: 'vm',
                        size: 'lg',
                    });
                };

                scope.updateMaterial = function(updMaterial){
                    var omittedMat = _.omit(updMaterial, 'material_added_by', 'material_updated_by', 'student');
                    var materialId = updMaterial.id;
                    var newMaterial = omittedMat;

                    Upload.upload({
                        url: 'api/v1/student-materials/'+materialId+'/',
                        data: newMaterial,
                        method: 'PUT',
                    })
                    .then(function(response){
                        var index = scope.materials.indexOf(updMaterial);
                        scope.materials[index] = response.data;
                    }, function(response){
                        console.log('Error status: ' + response.status);
                    }, function(evt){
                        var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                        scope.fileProgress = progressPercentage;
                    });
                };

                scope.addMaterial = function(material){
                    Upload.upload({
                        url: 'api/v1/student-materials/',
                        data: material,
                    })
                    .then(function (resp) {
                        scope.materials.push(resp.data);
                    }, function (resp) {
                        console.log(resp);
                        console.log('Error status: ' + resp.status);
                    }, function (evt) {
                        var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                        scope.fileProgress = progressPercentage;
                    });
                };

                scope.deleteMaterial = function(material){
                    var materialId = material.id;
                    scope.mat = material; 
                    if(material.student_group.length > 1 && !scope.authAcct.is_staff){
                        var delMaterial = _.clone(material);
                        delMaterial['group_student'] = _.without(_.pluck(delMaterial.student_group, 'id'), scope.userId);
                        delMaterial = _.omit(delMaterial, 'student_group');
                        scope.updateMaterial(delMaterial);
                        deleteStudentMaterialSuccess();
                    } else {
                        Users.deleteStudentMaterial(materialId)
                            .then(deleteStudentMaterialSuccess)
                            .catch(function(errorMsg){
                                console.log(errorMsg);
                            });
                    };
                };

                function deleteStudentMaterialSuccess(response){
                    var index = scope.materials.indexOf(scope.mat);
                    scope.materials.splice(index, 1); 
                };
            },
            templateUrl: function(elem,attrs) {
                return $sce.trustAsResourceUrl(static_path('views/directives/student-materials-'+attrs.tempType+'.directive.html'));
            }
        }
        return directive;
    }
})();