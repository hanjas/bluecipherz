'use strict';

/**
 * @ngdoc service
 * @name bluroeApp.TokenHandler
 * @description
 * # TokenHandler
 * Factory in the bluroeApp.
 */
angular.module('alFjrApp')
  .factory('TokenHandler', function ($http, loginService, $rootScope,$cookieStore) {
    // Service logic
    // ...

    var tokenHandler = {};
    var token;
    var user;
    // var projects; // temp implementation
    var tempLoggedin = false;

    var observerCallbacks = []; 

    if(angular.isDefined($cookieStore.get('userData'))){ 
    // temp login
    var e = $cookieStore.get('email');
    var p = $cookieStore.get('password');
    
    $http.post(loginService.host + '/authenticate', {email:e,password:p})
      .then(function(response, status, header, config) {
          set(response.data.token);
          user = response.data.user;
          $rootScope.authUser = response.data.user;
          // projects = response.data.projects; 
          tempLoggedin = true;
          notifyObservers();
      }, function(data, status, header, config) {
          console.log('login error')
      });
    
    // end temp login
    }

	//login
	var login = function(username,password,callback){ 
		$http.post(loginService.host + '/authenticate', {email:username,password:password})
	      .then(function(response, status, header, config) {
	          set(response.data.token);
	          user = response.data.user;
	          $rootScope.authUser = response.data.user;
	          // projects = response.data.projects; 
	          $cookieStore.put('token',token)
	          tempLoggedin = true;
	          notifyObservers();
	          callback(response);
	          $cookieStore.put('email',username);
	          $cookieStore.put('password',password);
	          $cookieStore.put('loggedIn',true);
	      }, function(data, status, header, config) {
            callback(data);
	      });
  	}
	//end login
    var notifyObservers = function() {
        angular.forEach(observerCallbacks, function(callback) {
            callback();
        });
    };

    var set = function(newToken) {
      token = newToken;
    }

    tokenHandler.get = function() {
      return token;
    }

    var wrapActions = function(resource, actions) {
      var wrappedResource = resource;
      for(var i=0; i < actions.length; i++) {
        tokenWrapper(wrappedResource, actions[i]);
      }
      // return modified copy of resource
      return wrappedResource;
    };

    // wraps resource action to send request with auth token
    var tokenWrapper = function(resource, action) {
      // copy original action
      resource['_' + action] = resource[action];
      resource[action] = function(data, success, error) {
        return resource['_' + action](
          angular.extend({}, data || {}, {token: tokenHandler.get()}),
          success,
          error
        );
      };
    };

    // Public API here
    return {
      wrapActions : wrapActions,
      getUser : function() {
        return user;
      },
      getProjects : function() {
        return projects;
      },
      onTempLogin: function(callback) {
        observerCallbacks.push(callback);
      },
      login: function(u,p,c) { 
        return login(u,p,c);
      },
      isTempLogged: function() {
        return tempLoggedin;
      },
      getToken: tokenHandler.get
    };
  });
