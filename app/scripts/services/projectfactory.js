'use strict';

/**
 * @ngdoc service
 * @name alFjrApp.projectFactory
 * @description
 * # projectFactory
 * Factory in the alFjrApp.
 */
 angular.module('alFjrApp')
 .factory('projectFactory', projectFactory);

 function projectFactory(TokenHandler, $resource, loginService) {
    var vm = this;

    var observerCallbacks = [];
    var reloadEverytime = false;
    var projects = [];
    var params = {};

    var Projects = TokenHandler.wrapActions(
        $resource(loginService.host + '/projects'),
        ['query']
    );  
    
    vm.fetching = false; 

     function GetProjects(callBack){ 
        vm.fetching = true;
        Projects.query(params).$promise.then(function(results) {
            callBack(results);
            vm.fetching = false; 
        });  
     }

    return {
        getProjects: function(callBack) {
            GetProjects(callBack);
        },
    }

}