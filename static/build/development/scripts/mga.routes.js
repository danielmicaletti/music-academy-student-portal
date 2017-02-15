(function () {
    'use strict';

    angular
        .module('mga.routes')
        .config(config);

    config.$inject = ['$stateProvider', '$urlRouterProvider'];

    function config($stateProvider, $urlRouterProvider){

        $urlRouterProvider.otherwise(function($injector){
            var $state = $injector.get('$state');
            $state.go('app.dashboard');
        });

        $stateProvider
            .state('app', {
                abstract: true,
                url: '/app',
                controller: 'AppController',
                controllerAs: 'vm',     
                templateUrl: static_path('views/main/app.html'),
                data: {
                    requireLogin: true
                },
            })
            .state('app.dashboard', {
                url: '/dashboard/:userId',
                controller: 'DashBoardController',
                controllerAs: 'vm',     
                templateUrl: static_path('views/main/dashboard.html'),
                data: {
                    requireLogin: true
                },
            })
            .state('app.practiceroom', {
                url: '/practice-room/:userId',
                controller: 'PracticeRoomController',
                controllerAs: 'vm',     
                templateUrl: static_path('views/main/practiceroom.html'),
                data: {
                    requireLogin: true
                },
            })
            .state('app.student-locker', {
                url: '/student-locker/:userId',
                controller: 'StudentLockerController',
                controllerAs: 'vm',     
                templateUrl: static_path('views/main/studentlocker.html'),
                data: {
                    requireLogin: true
                },
            })
            .state('app.commonroom', {
                url: '/common-room/:userId',
                controller: 'CommonRoomController',
                controllerAs: 'vm',     
                templateUrl: static_path('views/main/commonroom.html'),
                data: {
                    requireLogin: true
                },
            })
            .state('app.leaderboard', {
                url: '/leaderboard/:userId',
                controller: 'LeaderBoardController',
                controllerAs: 'vm',     
                templateUrl: static_path('views/main/leaderboard.html'),
                data: {
                    requireLogin: true
                },
            })
            .state('app.profile', {
                url: '/profile/:userId',
                controller: 'UserProfileController',
                controllerAs: 'vm',     
                templateUrl: static_path('views/users/user-profile.html'),
                data: {
                    requireLogin: true
                },
            })
            .state('app.student-goal', {
                url: '/student-goals/:userId',
                controller: 'StudentGoalController',
                controllerAs: 'vm',     
                templateUrl: static_path('views/users/student-goal.html'),
                data: {
                    requireLogin: true
                },
            })
            .state('app.student-objective', {
                url: '/student-objectives/:userId',
                controller: 'StudentObjectiveController',
                controllerAs: 'vm',     
                templateUrl: static_path('views/users/student-objective.html'),
                data: {
                    requireLogin: true
                },
            })
            .state('app.student-practice', {
                url: '/student-practice/:userId',
                controller: 'StudentPracticeController',
                controllerAs: 'vm',     
                templateUrl: static_path('views/users/student-practice.html'),
                data: {
                    requireLogin: true
                },
            })
            .state('app.student-wishlist', {
                url: '/student-wishlist/:userId',
                controller: 'StudentWishListController',
                controllerAs: 'vm',     
                templateUrl: static_path('views/users/student-wishlist.html'),
                data: {
                    requireLogin: true
                },
            })
            .state('app.student-materials', {
                url: '/student-materials/:userId',
                controller: 'StudentMaterialsController',
                controllerAs: 'vm',     
                templateUrl: static_path('views/users/student-materials.html'),
                data: {
                    requireLogin: true
                },
            })
            .state('app.student-plan', {
                url: '/student-plan/:userId',
                controller: 'StudentPlanController',
                controllerAs: 'vm',     
                templateUrl: static_path('views/users/student-plan.html'),
                data: {
                    requireLogin: true
                },
            })
            .state('app.forum', {
                url: '/forum',
                controller: 'ForumController',
                controllerAs: 'vm',     
                templateUrl: static_path('views/forum/forum.html'),
                data: {
                    requireLogin: true
                },
            })
            .state('app.schedule', {
                url: '/schedule',
                controller: 'ScheduleController',
                controllerAs: 'vm',     
                templateUrl: static_path('views/schedule/schedule.html'),
                data: {
                    requireLogin: true
                },
            })
            .state('login', {
                url: '/login',
                controller: 'AuthenticationController',
                controllerAs: 'vm',     
                templateUrl: static_path('views/main/login.html'),
                data: {
                    requireLogin: false
                },
            })
            .state('logout', {
                url: '/logout',
                controller: 'LogoutController',
                controllerAs: 'vm',
                data: {
                    requireLogin: true
                },
            });
    };
})();

