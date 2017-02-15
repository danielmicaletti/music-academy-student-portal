(function(){
    'use strict';

    angular
        .module('main.controllers')
        .controller('AppController', AppController);

    AppController.$inject = ['$scope', '$sce', '$state', 'Main', 'Users'];

    function AppController($scope, $sce, $state, Main, Users){
        var vm = this;

        function activate(){
            if(Main.isAuthAcct()){
                vm.authAcct = Main.getAuthAcct();

                Users.getUser(vm.authAcct.id).then(function(response){
                    vm.currentUser = response;
                }).catch(function(errMsg){
                    Main.logout();
                });
            } else {
                console.log("Could not get account");
                $state.go('login');
            };
            loadSidebar();
        };

        $scope.$on("update_user_info", function(event, message){
            if(vm.authAcct.id == message.id){
                vm.currentUser = message;
            };
        });

        var mediaPath = media_path('');
        var staticPath = static_path('');

        $scope.path = { 
            static_files: $sce.trustAsResourceUrl(staticPath),
            media: $sce.trustAsResourceUrl(mediaPath),
        };

        $scope.playLevelColor = {
            '1': 'bg-white',
            '2': 'bg-yellow',
            '3': 'bg-orange',
            '4': 'bg-green',
            '5': 'bg-blue',
            '6': 'bg-purple',
            '7': 'bg-red',
            '8': 'bg-brown',
            '9': 'bg-black',
        };

        function loadSidebar(){
            var fixedTop = false;

            var navbar_initialized = false;

                vm.lbd = {
                    misc:{
                        navbar_menu_visible: 0
                    },

                    initRightMenu: function(){
                        if(!navbar_initialized){
                            vm.off_canvas_sidebar = $('nav').find('.navbar-collapse').first().clone(true);

                            vm.sidebar = $('.sidebar');
                            vm.sidebar_bg_color = vm.sidebar.data('background-color');
                            vm.sidebar_active_color = vm.sidebar.data('active-color');

                            vm.logo = vm.sidebar.find('.logo').first();
                            vm.logo_content = vm.logo[0].outerHTML;

                            vm.ul_content = '';

                            // set the bg color and active color from the default sidebar to the off canvas sidebar;
                            vm.off_canvas_sidebar.attr('data-background-color',vm.sidebar_bg_color);
                            vm.off_canvas_sidebar.attr('data-active-color',vm.sidebar_active_color);

                            vm.off_canvas_sidebar.addClass('off-canvas-sidebar');

                            //add the content from the regular header to the right menu
                            vm.off_canvas_sidebar.children('ul').each(function(){
                                vm.content_buff = $(this).html();
                                vm.ul_content = vm.ul_content + vm.content_buff;
                            });

                            // add the content from the sidebar to the right menu
                            vm.content_buff = vm.sidebar.find('.nav').html();
                            vm.ul_content = vm.ul_content + '<li class="divider"></li>'+ vm.content_buff;

                            vm.ul_content = '<ul class="nav navbar-nav">' + vm.ul_content + '</ul>';

                            vm.navbar_content = vm.logo_content + vm.ul_content;
                            vm.navbar_content = '<div class="sidebar-wrapper">' + vm.navbar_content + '</div>';

                            vm.off_canvas_sidebar.html(vm.navbar_content);

                            $('body').append(vm.off_canvas_sidebar);

                             vm.toggle = $('.navbar-toggle');

                             vm.off_canvas_sidebar.find('a').removeClass('btn btn-round btn-default');
                             vm.off_canvas_sidebar.find('button').removeClass('btn-round btn-fill btn-info btn-primary btn-success btn-danger btn-warning btn-neutral');
                             vm.off_canvas_sidebar.find('button').addClass('btn-simple btn-block');

                             vm.toggle.click(function(){
                                if(vm.lbd.misc.navbar_menu_visible == 1) {
                                    $('html').removeClass('nav-open');
                                    vm.lbd.misc.navbar_menu_visible = 0;
                                    $('#bodyClick').remove();
                                     setTimeout(function(){
                                        vm.toggle.removeClass('toggled');
                                     }, 400);

                                } else {
                                    setTimeout(function(){
                                        vm.toggle.addClass('toggled');
                                    }, 430);

                                    vm.div = '<div id="bodyClick"></div>';
                                    $(vm.div).appendTo("body").click(function() {
                                        $('html').removeClass('nav-open');
                                        vm.lbd.misc.navbar_menu_visible = 0;
                                        $('#bodyClick').remove();
                                         setTimeout(function(){
                                            vm.toggle.removeClass('toggled');
                                         }, 400);
                                    });

                                    $('html').addClass('nav-open');
                                    vm.lbd.misc.navbar_menu_visible = 1;

                                }
                            });

                            vm.sideMenu = $('.side-menu');

                             vm.sideMenu.click(function (){
                                if(vm.lbd.misc.navbar_menu_visible == 1) {
                                    $('html').removeClass('nav-open');
                                    vm.lbd.misc.navbar_menu_visible = 0;
                                    $('#bodyClick').remove();
                                     setTimeout(function(){
                                        vm.toggle.removeClass('toggled');
                                     }, 400);

                                } else {
                                    setTimeout(function(){
                                        vm.toggle.addClass('toggled');
                                    }, 430);

                                    vm.div = '<div id="bodyClick"></div>';
                                    $(vm.div).appendTo("body").click(function() {
                                        $('html').removeClass('nav-open');
                                        vm.lbd.misc.navbar_menu_visible = 0;
                                        $('#bodyClick').remove();
                                         setTimeout(function(){
                                            vm.toggle.removeClass('toggled');
                                         }, 400);
                                    });

                                    $('html').addClass('nav-open');
                                    vm.lbd.misc.navbar_menu_visible = 1;

                                }
                            });

                            navbar_initialized = true;
                        };
                    }
                };

            $(document).ready(function(){
                var window_width = $(window).width();
                // Init navigation toggle for small screens
                if(window_width <= 991){
                    window.setTimeout(vm.lbd.initRightMenu, 1000);
                };
                //  Activate the tooltips
                $('[rel="tooltip"]').tooltip();
            });

            // activate collapse right menu when the windows is resized
            $(window).resize(function(){
                if($(window).width() <= 991){
                    vm.lbd.initRightMenu();
                };
            });

            function debounce(func, wait, immediate) {
                var timeout;
                return function() {
                    var context = this, args = arguments;
                    clearTimeout(timeout);
                    timeout = setTimeout(function(){
                        timeout = null;
                        if(!immediate) func.apply(context, args);
                    }, wait);
                    if(immediate && !timeout) func.apply(context, args);
                };
            };
        };
        
        activate();
    };
})();
