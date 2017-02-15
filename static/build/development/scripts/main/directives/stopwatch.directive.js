(function(){
    'use strict';

    angular
        .module('main.directives')
        .directive('stopWatch', stopWatch);

    stopWatch.$inject = ['$sce', '$timeout', '$interval', 'ngAudio'];

    function stopWatch($sce, $timeout, $interval, ngAudio) {
        var directive = {
            restrict: 'EA',
            scope: {
                path: "=",
            },
            link: function(scope, elem, attrs) {
                var timeoutId;
                scope.seconds = 0;
                scope.minutes = 0;
                scope.hours = 0;
                
                scope.running = false;

                var tickUrl = static_path('sounds/tick.mp3');
                var tockUrl = static_path('sounds/tock.mp3');

                scope.tick = ngAudio.load(tickUrl);
                scope.tock = ngAudio.load(tockUrl);

                scope.metTimeoutId = 0;
                scope.timeoutClearId = 0;
                scope.oneMin = 60000;
                scope.bpm = 100;
                scope.bpb = 4;
                scope.beatCount = 1;
                scope.left = 1;
                scope.turnedOn = false;

                function activate(){
                    scope.twelve = [];
                    scope.sixty = [];
                    for(var s = 0; s < 60; s++){
                        scope.sixty.push(s);
                    };
                    for(var t = 0; t <= 12; t++){
                        scope.twelve.push(t);
                    };

                    var agl = angular || {};
                    var ua  = navigator.userAgent;

                    agl.ff = ua.indexOf('Firefox') != -1;
                    agl.chr = ua.indexOf('Chrome') != -1;
                    agl.saf = ua.indexOf('Safari') != -1 && !agl.chr;

                    if(agl.saf){
                        scope.metAlert = "For best results use Metronome in Google Chrome or FireFox";
                    };
                };

                scope.bpmPlus = function(bpm){
                    var currentValue = parseFloat(bpm);
                    scope.bpm = parseFloat(currentValue+1);  
                };

                scope.bpmMinus = function(bpm){
                    var currentValue = parseFloat(bpm);
                    scope.bpm = parseFloat(currentValue-1);  
                };

                scope.bpbPlus = function(bpb){
                    var currentValue = parseFloat(bpb);
                    scope.bpb = parseFloat(currentValue+1);                     
                };

                scope.bpbMinus = function(bpb){
                    var currentValue = parseFloat(bpb);
                    scope.bpb = parseFloat(currentValue-1);                     
                };

                scope.startMet = function(){
                    if(scope.turnedOn){
                        return false;
                    };
                    scope.beatCount = 1;
                    beat();
                    scope.turnedOn = true;
                };

                scope.stopMet = function(){
                    $timeout.cancel(scope.metTimeoutId);
                    scope.beatCount = 1;
                    beatReset();
                    scope.turnedOn = false; 
                };

                function beat(){
                    var interval = scope.oneMin/scope.bpm;
                    scope.metTimeoutId = $timeout(beat, interval);

                    moveBeatBar();

                    scope.beatCount++;
                    if(scope.beatCount > scope.bpb){
                        scope.beatCount = 1;
                    };

                    if(scope.beatCount == 1){
                        barBeep();
                    } else {
                        beep();
                    };
                };

                function beep(){
                    scope.tock.stop();
                    scope.tick.play();
                };

                function barBeep(){
                    scope.tick.stop();
                    scope.tock.play();
                };

                function moveBeatBar(){
                    var bps = 1/(scope.bpm/60);
                    if(scope.left){
                        scope.beatReset = false;
                        scope.beatRight = false;
                        scope.beatLeft = true;
                        scope.beatBarStyle = {
                            '-webkit-transition': 'all '+bps+'s ease-in-out',
                            '-moz-transition': 'all '+bps+'s ease-in-out',
                            '-o-transition': 'all '+bps+'s ease-in-out',
                            transition: 'all '+bps+'s ease-in-out',
                        }
                        scope.left = 0;
                    } else {
                        scope.beatReset = false;
                        scope.beatLeft = false;
                        scope.beatRight = true;
                        scope.left++;

                    };
                };

                function beatReset(){
                    scope.beatRight = false;
                    scope.beatLeft = false;
                    scope.beatReset = true;
                };
 
                scope.setTime = function(){
                    if(scope.setHours > 0){
                        scope.hours = scope.setHours;
                    } else {
                        scope.hours = 0;
                    };
                    if(scope.setMinutes > 0){
                        scope.minutes = scope.setMinutes;
                    } else {
                        scope.minutes = 0;
                    };
                    scope.seconds = 0;
                };

                scope.stop = function() {
                    $interval.cancel(timeoutId);
                    scope.running = false;
                };

                scope.start = function() {
                    if(scope.seconds == 0 && scope.minutes == 0 && scope.hours == 0){
                        scope.setTime();
                    };
                    timer();
                    scope.running = true;
                };

                scope.clear = function() {
                    scope.hours = 0;
                    scope.seconds = 0;
                    scope.minutes = 0;
                };

                function timer() {
                    timeoutId = $interval(function() {
                        updateTime(); 
                    }, 1000);
                };

                function updateTime() {
                    if(scope.seconds == 0){
                        scope.seconds = 59;
                        if(scope.minutes == 0){
                            scope.minutes = 59;
                            if(scope.hours > 0){
                                scope.hours --;
                            };
                        } else if(scope.minutes == 1){
                            scope.minutes = 0;
                        } else if(scope.minutes > 1){
                            scope.minutes --;
                        };
                    } else {
                        if(scope.seconds == 1 && scope.minutes == 0 && scope.hours == 0){
                            scope.seconds = 0;
                            scope.stop();
                        } else if(scope.seconds >= 1){
                            scope.seconds --;
                        };
                    };
                };

                activate();
            },

            templateUrl: function(elem,attrs) {
                return $sce.trustAsResourceUrl(static_path('views/directives/stopwatch.directive.html'));
            }
        }
        return directive;
    };
})();
  