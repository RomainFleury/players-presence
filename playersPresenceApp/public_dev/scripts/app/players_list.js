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
