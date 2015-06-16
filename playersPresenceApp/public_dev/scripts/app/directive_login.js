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
