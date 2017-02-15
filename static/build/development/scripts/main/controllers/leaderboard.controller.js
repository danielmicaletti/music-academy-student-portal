(function(){
    'use strict';

    angular
        .module('main.controllers')
        .controller('LeaderBoardController', LeaderBoardController);

    LeaderBoardController.$inject = ['$scope', '$state', '$stateParams', 'Main', 'Users'];

    function LeaderBoardController($scope, $state, $stateParams, Main, Users){
        var vm = this;

        vm.loading = true;

        vm.showInactive = '';

        function activate(){
            if(Main.isAuthAcct()){
                vm.authAcct = Main.getAuthAcct();
                if($stateParams.userId && vm.authAcct.is_staff){
                    vm.dashId = $stateParams.userId;                   
                } else {
                    vm.dashId = vm.authAcct.id;
                    $state.transitionTo('app.leaderboard', {userId: vm.dashId}, { notify: false });
                };
                Users.getUserLeaderBoard()
                    .then(getAllSuccess)
                    .catch(getAllError);
            } else {
                $state.go('login');
            };
        };

        function getUser(userId, users){
            var curUser = _.findWhere(users, {'id': parseInt(userId)});
            if(curUser){
                vm.user = curUser;
            } else {
                $state.go('app.dashboard');
            };
        };

        function getAllSuccess(response){
            vm.allUsers = response;
            getUser(vm.dashId, vm.allUsers);
            vm.leaderUsers = angular.copy(response);
            vm.setLeaderboard(vm.leaderUsers);
            pageSetup(vm.allUsers);
            vm.loading = false;
        };

        function getAllError(errMsg){
            console.log(errMsg);
        };

        function pageSetup(users){
            vm.viewby = '10';
            vm.totalItems = users.length;
            vm.currentPage = 1;
            vm.itemsPerPage = vm.viewby;
            vm.maxSize = 5;

        };

        vm.setPage = function(pageNo){
            vm.currentPage = pageNo;    
        };

        vm.setItemsPerPage = function(num){
            vm.itemsPerPage = num;
            vm.currentPage = 1;
        };

        vm.dateRange = moment("12-25-1995", "MM-DD-YYYY");

        vm.setLeaderboard = function(users){
            vm.tempLeaderBoard = [];
            angular.forEach(users, function(v,k){
                if(v.student_log.length){
                    v.student_log = _.filter(v.student_log, function(item){
                        if(item.practice_date){
                            return moment(item.practice_date).isAfter(vm.dateRange);
                        };
                    })
                    if(v.student_log.length){
                        var sums = vm.getSum(v.student_log);
                    } else {
                        var sums = {
                            max_speed: 0,
                            speed_total: 0,
                            speed_avg: 0,                
                            time_total: 0,
                            time_avg: 0,
                            last_practice: 'no practice',
                        };
                    };
                    
                } else {
                    var sums = {
                        max_speed: 0,
                        speed_total: 0,
                        speed_avg: 0,                
                        time_total: 0,
                        time_avg: 0,
                        last_practice: 'no practice',
                    };
                };

                if(v.student_goal.length){
                    v.student_goal = _.filter(v.student_goal, function(item){
                        return moment(item.goal_complete_date).isAfter(vm.dateRange);
                    });
                    if(v.student_goal.length){
                        var sg = _.where(v.student_goal, {goal_complete: true}).length;
                    } else {
                        var sg = 0;
                    };
                } else {
                    var sg = 0;
                };

                if(v.student_objective.length){
                    v.student_objective = _.filter(v.student_objective, function(item){
                        return moment(item.objective_complete_date).isAfter(vm.dateRange);
                    });
                    if(v.student_objective.length){
                        var so = _.where(v.student_objective, {objective_complete: true}).length;
                    } else {
                       var so = 0; 
                    };
                } else {
                    var so = 0;
                };

                if(v.student_wishlist.length){
                    v.student_wishlist = _.filter(v.student_wishlist, function(item){
                        return moment(item.wish_item_complete_date).isAfter(vm.dateRange);
                    });
                    if(v.student_wishlist.length){
                        var swl = _.where(v.student_wishlist, {wish_item_complete: true}).length;
                    } else {
                        var swl = 0;
                    };
                } else {
                    var swl = 0;
                };

                var tempUser = {
                    id: v.id,
                    is_active: v.is_active,
                    first_name: v.first_name,
                    last_name: v.last_name,
                    play_level: v.play_level,
                    practice_speed_high: sums.max_speed,
                    practice_speed_avg: sums.speed_avg,
                    practice_speed_total: sums.speed_total,
                    practice_time_avg: sums.time_avg,
                    practice_time_total: sums.time_total,
                    practice_count: v.student_log.length,
                    last_practice_date: sums.last_practice,
                    goals_complete: sg,
                    objectives_complete: so,
                    wishes_complete: swl,
                };
                vm.tempLeaderBoard.push(tempUser);
            });
            vm.leaderBoard = vm.tempLeaderBoard;
        };

        vm.getSum = function(studentLog){
            var times = [];
            var speeds = [];
            var avgDaily = [];
            var maxSpeed = 0;
            var lastPrac = '';
            angular.forEach(studentLog, function(v,k){
                if(v.practice_time){
                    var tempAvg = {};
                    var time = parseInt(v.practice_time);
                    times.push(time);

                    if(avgDaily.length){
                        var prac = _.findWhere(avgDaily, {date: v.practice_date});
                        if(prac){
                            prac.tot = parseInt(prac.tot) + time;
                        } else {
                            tempAvg.tot = time;
                            tempAvg.date = v.practice_date;
                            avgDaily.push(tempAvg);
                        };
                    } else {
                        tempAvg.tot = time;
                        tempAvg.date = v.practice_date;
                        avgDaily.push(tempAvg);
                    };
                };

                if(v.practice_speed){
                    var speed = parseInt(v.practice_speed);
                    if(speed > maxSpeed){
                        maxSpeed = speed;
                    };
                    speeds.push(speed);
                };

                if(v.practice_date){
                    if(v.practice_date > lastPrac){
                        lastPrac = v.practice_date;
                    };
                };
            });

            if(times.length){
                var sumTimes = times.reduce(function(a, b) { return a + b; });
            } else {
                var sumTimes = 0;
            };

            if(speeds.length){
                var sumSpeeds = speeds.reduce(function(a, b) { return a + b; });
            } else {
                var sumSpeeds = 0;
            };
            
            if(avgDaily.length){
                var sumDaily = 0;
                _.each(avgDaily, function(v,k){ sumDaily += v.tot; })
            } else {
                var sumDaily = 0;
            };

            return {
                max_speed: maxSpeed,
                speed_total: sumSpeeds,
                speed_avg: sumSpeeds / speeds.length,                
                time_total: sumTimes,
                time_avg: sumDaily / avgDaily.length,
                last_practice: lastPrac,
            };       
        };

        vm.getRange = function(range){
            vm.rangeBy = range;
            if(vm.rangeBy === 'all'){
                vm.resetLeaderboard();
            } else {
                vm.adjDate = moment().subtract(1, range);
                vm.dateRange = vm.adjDate;
                var rangeUsers = angular.copy(vm.allUsers);
                vm.setLeaderboard(rangeUsers);
            };
        };

        vm.getRange('month');

        vm.displayItems = vm.leaderBoard.slice(0, vm.itemsPerPage);

        vm.resetLeaderboard = function(){
            vm.dateRange = moment("12-25-1995", "MM-DD-YYYY");
            var resetUsers = angular.copy(vm.allUsers);
            vm.setLeaderboard(resetUsers);
        };

        activate();
    };
})();
