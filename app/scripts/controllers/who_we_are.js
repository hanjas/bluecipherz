'use strict';

/**
 * @ngdoc function
 * @name alFjrApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the alFjrApp
 */

angular.module('alFjrApp')
  .controller('WhoWeAreCtrl', function ($rootScope,$state,headerService) {  
    var vm = this; 
    headerService.hTopHeight = 550 ;
    headerService.setScroll();
    headerService.setPage();

    setPage();
    function setPage(){ 
      setTimeout(function(){  
        $('.homeTop').css({opacity:1}); 
      },10);
    }
    vm.scrollArrow = function(){
      var body = $("html, body");
      body.stop().animate({scrollTop:headerService.hTopHeight - 100}, 1000, 'swing');
    }

  })