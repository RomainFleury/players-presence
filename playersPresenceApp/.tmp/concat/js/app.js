/**
 * players.js
 *
 * @author   Romain FLEURY <fleury@romain.in>
 */
(function () {
    "use strict";
    angular.module("players", []);
    angular.module("players").provider("localPlayersService", [function () {

        this.$get = ["$log", function ($log) {

            var defaultAvatar = "/images/default-avatar.jpg";

            var playerFormat = {
                "name": "",
                "avatar": defaultAvatar,
                "present":null,
                "noresponse":true
            };

            function getPlayers() {
                var deferred = $q.defer();
                var stored = JSON.parse(localStorage.getItem("players"));
                deferred.resolve(stored ? stored : []);
                return deferred.promise;
            }


            function savePlayers(players) {
                var deferred = $q.defer();
                localStorage.setItem("players", JSON.stringify(players));
                deferred.resolve(players);
                return deferred.promise;
            }

            function updatePlayer(player) {
                var deferred = $q.defer();

                var players = getPlayers();
                var changed = false;
                // udpate players
                // search players in players
                var playerIndex;
                for (playerIndex in players) {
                    if (players[playerIndex] && players[playerIndex].id) {
                        if (players[playerIndex].id === player.id) {
                            // player found, must be updated
                            players[playerIndex] = player;
                            changed = true;
                        }
                    }
                }
                if (changed) {
                    // save updated players
                    savePlayers(players).then(function(players){
                        deferred.resolve(players);
                    });
                }
                return deferred.promise;
            }

            function addPlayer(playerName) {
                var deferred = $q.defer();
                var players = getPlayers();
                var playersCount = players.length;
                var player = angular.copy(playerFormat);
                player.name = playerName;
                player.id = playersCount + 1;

                players.push(player);

                // save players if player list changed
                if (playersCount < players.length) {
                    savePlayers(players).then(function(players){
                        deferred.resolve(player);
                        $log.info("player added");
                    });
                }
                return deferred.promise;
            }

            return {
                "format": angular.copy(playerFormat),
                "findByName": findPlayerByName,
                "findById": findPlayerById,
                "list": getPlayers,
                "add": addPlayer,
                "update": updatePlayer
            };
        }];
    }]);
})();
/**
 * players.js
 *
 * @author   Romain FLEURY <fleury@romain.in>
 */
(function () {
    "use strict";
    angular.module("players").provider("parsePlayersService", [function () {

        this.$get = ["$log", "$q", "User", function ($log, $q, User) {

            var defaultAvatar = "/images/default-avatar.jpg";
            // PARSE
            var parsePlayer = Parse.Object.extend("players");

            var playerFormat = {
                "name": "",
                "avatar": defaultAvatar,
                "present":null,
                "noresponse":true
            };

            function preparePlayerToList(player) {
                var tmp = angular.copy(playerFormat);
                tmp.id = player.id;
                tmp.name = player.attributes.name;
                tmp.avatar = player.attributes.avatar;
                tmp.present = player.attributes.present;
                tmp.noresponse = player.attributes.noresponse;
                tmp.changing = false;
                return tmp;
            }

            function getPlayers() {
                var deferred = $q.defer();
                var query = new Parse.Query(parsePlayer);
                query.find({
                    success: function (results) {
                        var players = [];
                        if (results.length > 0) {
                            for (var i = 0; i < results.length; i++) {
                                players[i] = preparePlayerToList(results[i]);
                            }
                        }
                        deferred.resolve(players);
                    },
                    error: function (error) {
                        //alert("Error: " + error.code + " " + error.message);
                        deferred.reject(error);
                    }
                });
                return deferred.promise;
            }

            function updatePlayer(player) {
                var deferred = $q.defer();
                var query = new Parse.Query(parsePlayer);
                query.get(player.id, {
                    success: function (savedPlayer) {
                        savedPlayer.save({
                            "name": player.name,
                            "present":player.present,
                            "noresponse":player.noresponse,
                            "avatar": player.avatar
                        }).then(function () {
                            deferred.resolve(preparePlayerToList(savedPlayer));
                        });
                    },
                    error: function (error) {
                        //alert("Error: " + error.code + " " + error.message);
                        deferred.reject(error);
                    }
                });
                return deferred.promise;
            }

            function addPlayer(playerName) {
                var deferred = $q.defer();
                var player = angular.copy(playerFormat);
                player.name = playerName;

                var newPlayer = new parsePlayer();
                //var ACLs = User.acl();
                newPlayer.save({
                        "name": playerName,
                        "avatar": defaultAvatar,
                        "ACL":User.acl()
                    }
                ).then(
                    function (savedPlayer) {
                        deferred.resolve(preparePlayerToList(savedPlayer));
                    }
                );
                return deferred.promise;
            }

            function removePlayer(player) {
                var deferred = $q.defer();
                if (player.id) {
                    console.log("Remove player : " + player.id);
                    var query = new Parse.Query(parsePlayer);
                    query.get(player.id, {
                        success: function (playerToRemove) {
                            playerToRemove.destroy({
                                success: function(){
                                    deferred.resolve();
                                },
                                error: function(){
                                    deferred.reject();
                                }
                            });
                        },
                        error: function (error) {
                            //alert("Error: " + error.code + " " + error.message);
                            deferred.reject(error);
                        }
                    });
                }
                return deferred.promise;
            }

            return {
                "format": angular.copy(playerFormat),
                "list": getPlayers,
                "remove": removePlayer,
                "add": addPlayer,
                "update": updatePlayer
            };
        }];
    }]);
})();
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

    angular.module("playersPresence", ["ngRoute", "ngAnimate", "ngMaterial", "players", "UsersServices"]);
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

(function () {

    "use strict";

    angular.module("playersPresence").directive("login", function () {
        var loginDirective = function ($scope, $log, $mdToast, User) {
            var self = this;

            self.login = true;
            self.errors = "";

            function toast(message, type) {
                $mdToast.show({
                    template: "<md-toast class=\"login-" + type + "\"><span flex>" + message + "</span></md-toast>",
                    hideDelay: 3000,
                    position: "top left"
                });
            }

            function toastError(message) {
                toast(message, "error");
            }

            function toastSuccess(message) {
                toast(message, "success");
            }

            function logIn() {
                User.login(self.username, self.password).then(function () {
                    $log.debug("login sucessful");
                    $scope.app.loggedIn = true;
                    toastSuccess("Re-bonjour !");
                }, function (reason) {
                    $log.debug("login failed");
                    self.errors = reason.message;
                    toastError(reason.message);
                });
            }

            function signUp() {
                User.signup(self.username, self.password, self.email).then(function () {
                    $log.debug("signup done");
                    $scope.app.loggedIn = true;
                    toastSuccess("Bienvenue !");
                });
            }

            self.submitForm = function () {
                if (self.login === true) {
                    logIn();
                } else {
                    signUp();
                }
            };

            self.logout = $scope.app.logout;

        };

        var loginLink = function (scope, element, attrs, controller) {
            //console.log("login link executed");
        };

        return {
            templateUrl: "templates/login.html",
            replace: true,
            controllerAs: "loginDirectiveCtrl",
            controller: ["$scope", "$log", "$mdToast", "User", loginDirective],
            link: loginLink
        };
    });
})();

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

(function () {
    "use strict";

    angular.module("playersPresence").controller("PlayersListCtrl", ["$scope", "parsePlayersService", "$rootScope", "$mdDialog","$log", function ($scope, Players, $rootScope, $mdDialog, $log) {
        var self = this;
        self.loading = true;
        self.Players = [];

        $rootScope.$on('playersListChanged', function () {
            $log.info('playersListChangedTriggered');
            getPlayers();
        });

        function getPlayers() {
            self.loading = true;
            Players.list().then(function (list) {
                self.loading = false;
                self.Players = list;
            });
        }

        self.init = function () {
            getPlayers();
        };

        self.togglePresence = function(player){
            $log.debug("togglePresenct !");
            player.changing = true;
            player.present = player.present !== true;
            player.noresponse = false;
            Players.update(player).then(function(playerUpdated){
                $log.debug("playerUpdated");
                player.changing = false;
                //$rootScope.$emit('playersListChanged');
            });
        };

        self.confirmRemove = function(ev, player) {
            // Appending dialog to document.body to cover sidenav in docs app
            player.changing = true;
            var confirm = $mdDialog.confirm()
                .parent(ev.target)
                .title('Supprimer ' + player.name + ' ?')
                .content('Êtes vous sûr de vouloir supprimer ' + player.name + ' ?')
                .ariaLabel('remove')
                .ok('Oui, supprimer')
                .cancel('Annuler')
                .targetEvent(ev);
            $mdDialog.show(confirm).then(function () {
                Players.remove(player).then(function () {
                    self.Players.splice(self.Players.indexOf(player), 1);
                });
            }, function () {
                player.changing = false;
            });
        };
    }]);
})();

(function() {
    "use strict";

    angular.module("UsersServices", []);


    var User = function() {

        this.appPrefix = "";

        this.$get = ["$q", "$log",
            function($q, $log) {

                var appPrefix = this.appPrefix;

                function saveSessionToken() {
                    var sessionToken = Parse.User.current().getSessionToken();
                    window.localStorage.setItem("sessionToken_"+appPrefix, sessionToken);
                }

                var logout = function() {
                    Parse.User.logOut();
                    window.localStorage.removeItem("sessionToken");
                    //window.localStorage.clear();
                };

                var login = function(username, password) {
                    var deferred = $q.defer();
                    Parse.User.logIn(username, password, {
                        success: function(user) {
                            $log.debug("logged in (login)");
                            saveSessionToken();
                            deferred.resolve(user);
                        },
                        error: function(user, error) {
                            $log.error(error);
                            //self.$(".login-form .error").html("Invalid username or password. Please try again.").show();
                            //                  this.$(".login-form button").removeAttr("disabled");
                            deferred.reject(error);
                        }
                    });
                    return deferred.promise;
                };
                var signup = function(username, password, email) {
                    var deferred = $q.defer();

                    var newUser = new Parse.User();
                    newUser.set("username", username);
                    newUser.set("password", password);
                    newUser.set("email", email);
                    newUser.set("ACL", new Parse.ACL());
                    // other fields can be set just like with Parse.Object
                    //user.set("phone", "415-392-0202");
                    newUser.signUp(null, {
                        success: function(user) {
                            // Hooray! Let them use the app now.
                            $log.debug("logged in (signUp)");
                            deferred.resolve(user);
                        },
                        error: function(user, error) {
                            // Show the error message somewhere and let the user try again.
                            $log.error(error);
                            deferred.reject(error);
                        }
                    });
                    return deferred.promise;
                };

                var defaultRights = function() {
                    return new Parse.ACL(Parse.User.current());
                };

                var getSessionBack = function() {
                    var deferred = $q.defer();
                    var sessionToken = window.localStorage.getItem("sessionToken");
                    $log.debug("0");
                    if (sessionToken !== null) {
                        $log.debug("1");
                        // login with stored sessionToken
                        Parse.User.become(sessionToken).then(function(user) {
                            $log.debug("2");
                            // The current user is now set to user.
                            $log.debug("user is back");
                            deferred.resolve(user);
                        }, function(error) {
                            $log.debug("3");
                            // The token could not be validated.
                            $log.error(error);
                            deferred.reject(error);
                            //self.$(".signup-form .error").html(error.message).show();
                            //this.$(".signup-form button").removeAttr("disabled");
                        });
                        $log.debug("4");
                    } else {
                        $log.debug("5");
                        deferred.reject();
                    }
                    return deferred.promise;
                };

                return {
                    acl: defaultRights,
                    current: Parse.User.current,
                    login: login,
                    signup: signup,
                    logout: logout,
                    resume: getSessionBack
                };
            }
        ];
    };

    angular.module("UsersServices").provider("User", User);

    var runUserServices = function($log, User) {
        $log.debug("RUN USER SERVICES");
        var resumeDone = false;
        User.resume().then(function() {
            resumeDone = true;
        }, function() {
            resumeDone = true;
        });

        if (resumeDone === false) {
            var resume = window.setInterval(function() {
                //console.log("resume wait");
                if (resumeDone === true) {
                    window.clearInterval(resume);
                }
            }, 100);
        }

        $log.debug("RUN DONE");
    };
    angular.module("UsersServices").run(["$log", "User", runUserServices]);
})();
