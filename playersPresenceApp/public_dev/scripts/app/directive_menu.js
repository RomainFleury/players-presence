(function () {

    "use strict";

    angular.module("playersPresence").directive("menu", function () {
        var menuDirectiveController = function ($scope, $log, $location, Players, $rootScope) {
            var self = this;

            self.player = {
                name: ""
            };

            self.addPlayer = function(){
                var playerName = self.player.name;
                Players.add(playerName).then(function(){
                    self.player.name = "";
                    $log.info("Player added");
                    $rootScope.$emit('playersListChanged');
                });
            };
        };

        var menuLink = function (scope, element, attrs, controller) {
            //console.log("menu Directive link executed");
        };

        return {
            templateUrl: "templates/menu.html",
            replace: true,
            transclude: true,
            restrict: "E",
            controller: ["$scope", "$log", "$location", "parsePlayersService", "$rootScope", menuDirectiveController],
            controllerAs: "menu",
            link: menuLink
        };
    });
})();
