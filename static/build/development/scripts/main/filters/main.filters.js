(function(){
    'use strict';

    angular
        .module('main.filters')
        .filter('numberpad', numberpad);

        numberpad.$inject = [];

        function numberpad() {
            return function(input, places){
                var out = "";
                if(places){
                    var placesLength = parseInt(places, 10);
                    var inputLength = input.toString().length;

                    for(var i = 0; i < (placesLength - inputLength); i++){
                        out = '0' + out;
                    };  
                    out = out + input;
                };
                return out;
            };
        }; 

    angular
        .module('main.filters')
        .filter('propsFilter', propsFilter);

        propsFilter.$inject = [];

        function propsFilter() {
            return function(items, props){
                var out = [];

                if(angular.isArray(items)){
                    var keys = Object.keys(props);

                    items.forEach(function(item) {
                        var itemMatches = false;

                        for(var i = 0; i < keys.length; i++){
                            var prop = keys[i];
                            var text = props[prop].toLowerCase();
                            if(item[prop].toString().toLowerCase().indexOf(text) !== -1){
                                itemMatches = true;
                                break;
                            };
                        };

                        if(itemMatches){
                            out.push(item);
                        };
                    });
                } else {
                    out = items;
                };
                return out;
            };
        }; 
})();
