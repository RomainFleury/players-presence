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