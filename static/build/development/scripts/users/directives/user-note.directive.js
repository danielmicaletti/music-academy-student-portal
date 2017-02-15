(function(){
    'use strict';

    angular
        .module('users.directives')
        .directive('userNote', userNote);

    userNote.$inject = ['$sce', 'Users', 'Main', '$uibModal'];

    function userNote($sce, Users, Main, $uibModal){

        var directive = {
            restrict: 'EA',
            scope: {
                user: '=',
                note: '='
            },
            link: function(scope, elem, attrs){

                elem.on('click', function(){

                    var modalInstance = $uibModal.open({
                        templateUrl: $sce.trustAsResourceUrl(static_path('views/modals/user-note.modal.html')),
                        controller: function($scope, $uibModalInstance){
                            var vm = this;

                            vm.user = scope.user;

                            if(scope.note){
                                vm.note = scope.note;
                            };

                            vm.closeModal = function(){
                                $uibModalInstance.dismiss('cancel');
                            };

                            vm.addNote = function(newNote){
                                newNote['student'] = vm.user.id;
                                $uibModalInstance.close();
                                scope.postNote(newNote);
                            };

                            vm.editNote = function(note){
                                $uibModalInstance.close();
                                scope.updateNote(note);
                            };

                        },
                        controllerAs: 'vm',
                        size: 'md',

                    });

                });

                scope.postNote = function(newNote){
                    Users.createStudentNote(newNote)
                        .then(postNoteSuccess)
                        .catch(postNoteError);
                };

                scope.updateNote = function(note){
                    var updNote = {
                        note: note.note,
                    };
                    Users.updateStudentNote(note.id, updNote)
                        .then(function(response){
                            var index = scope.user.student_note.indexOf(updNote);
                            scope.user.student_note[index] = response;
                        })
                        .catch(postNoteError);
                };

                function postNoteSuccess(response){
                    scope.user.student_note.push(response);
                };

                function postNoteError(errMsg){
                    console.log(errMsg);
                };
            }
        };
        return directive;
    };
})();