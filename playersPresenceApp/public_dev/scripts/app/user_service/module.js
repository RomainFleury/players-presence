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
