'use strict';

/**
 * @ngdoc service
 * @name alFjrApp.feedFactory
 * @description
 * # feedFactory
 * Factory in the alFjrApp.
 */
 angular.module('alFjrApp')
 .factory('feedFactory', feedFactory);

 function feedFactory(TokenHandler, $resource, loginService) {
    var vm = this;

    var observerCallbacks = [];
    var reloadEverytime = false;
    var feeds = [];
    var params = {};

    var feedIsFetch = false;

    var Feed = TokenHandler.wrapActions(
        $resource(loginService.host + '/feeds'),
        ['query']
    ); 

    vm.fetching = false; 

    function getFetchedFeeds(callBack){
        if(!feedIsFetch){
            Feed.query(params).$promise.then(function(results) {
                feeds = results;
                callBack(results);
                vm.fetching = false; 
            });  
            feedIsFetch = true;
        }else{
            callBack(feeds);
        }
      return feeds;
    }

    function GetFeeds(callBack){ 
        vm.fetching = true;
        Feed.query(params).$promise.then(function(results) {
            callBack(results);
            vm.fetching = false; 
        });  
     } 

    function RemoveFeed(input,callBack){
        var Report = TokenHandler.wrapActions(
            $resource(loginService.host + '/feeds'),
            { 'delete':   {method:'DELETE'}, isArray:false}
        );  
        Report.delete({id:input}).$promise.then(function(results) {
            callBack(results);
        }); 
    }

    return {
        getFeeds: function(callBack) {
            return getFetchedFeeds(callBack);
        },
        fetchFeeds: function(callBack) {
            return GetFeeds(callBack);
        },
        removeFeed: function(input,callBack) {
            return RemoveFeed(input,callBack);
        },
    }

}