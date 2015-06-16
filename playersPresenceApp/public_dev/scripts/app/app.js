// Initialize Parse with your Parse application and javascript keys
Parse.initialize("pR9yHrpHVf7fYwsVqNwXugMbkWuR36M0i9MEWrHg", "bJmkwi3oQIpF8glhjsbLumVj9bTDMXkUCvtEsyHM");

/*
 var dimensions = {
 gender: "m",
 source: "web",
 dayType: "weekend"
 };
 Parse.Analytics.track("signup", dimensions);
 */


(function () {

    "use strict";

    angular.module("playersPresence", ["ngRoute", "ngAnimate", "ngMaterial", "players", "UsersServices", "TplCache"]);
    angular.module("playersPresence").config(["$routeProvider", "$mdThemingProvider", "UserProvider",
        function ($routeProvider, $mdThemingProvider, UserProvider) {
            $mdThemingProvider.theme("default")
                //.primaryPalette("deep-orange")
                //.accentPalette("indigo");
                .primaryPalette("green") // light-blue ! // brown // blue-grey // amber // deep-orange // deep-purple // light-blue // orange
                .accentPalette("brown") // brown
                .warnPalette("deep-orange");


            $routeProvider.
                when("/players", {
                    templateUrl: "templates/players-list.html",
                    controller: "PlayersListCtrl",
                    controllerAs: "playersList"
                }).
                when("/home", {
                    templateUrl: "templates/home.html"
                }).
                otherwise({
                    redirectTo: "/players"
                });

            UserProvider.appPrefix = "playersPresence";
        }
    ]);

    angular.module("playersPresence").controller("appController", ["$log", "$scope", "$route", "User",
        function ($log, $scope, $route, User) {
            var self = this;

            self.User = User;
            self.loggedIn = User.current() !== null;

            self.logout = function () {
                User.logout();
                $log.debug("app logout");
                self.loggedIn = false;
            };
        }
    ]);


    angular.module("playersPresence").directive("appContent", function () {

        var appContentDirectiveController = function ($scope, $http, $log, $mdSidenav, User, $mdToast) {

            var self = this;

            self.loading = true;

            self.toggleTab = function () {
                $mdSidenav("left").toggle();
            };
        };

        var appContentLink = function (scope, element, attrs, controller) {
//            console.log("appContent link executed");
//            console.log(scope.appContent);
//            console.log(controller);
        };
        return {
            templateUrl: "templates/app-content.html",
            replace: true,
            controllerAs: "appContent",
            controller: ["$scope", "$http", "$log", "$mdSidenav", "User", "$mdToast", appContentDirectiveController],
            link: appContentLink
        };
    });

})();
