'use strict';

/**
 * @ngdoc function
 * @name alFjrApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the alFjrApp
 */

angular.module('alFjrApp')
  .controller('MainCtrl', function ($rootScope,$state,headerService,$scope) {  
    var vm = this;
    var winHeight = $(window).height();

    var vm = this; 
    var hTopHeight = 550;
    headerService.hTopHeight = hTopHeight ;
    headerService.setScroll();
    headerService.setPage();

    setPage();
    function setPage(){ 
      var ph = winHeight - hTopHeight;
      $('.hm2_head').css({'line-height':ph+'px'});
      headerService.setPage();
      setTimeout(function(){  
        $('.homeTop').css({opacity:1}); 
      },10);
      setTimeout(function(){  
        vm.hmTab = 1;
        $scope.$apply();
      },500);
    }



    $(window).scroll(function(){ 
      vm.y = $(window).scrollTop();
      if(vm.y > ( winHeight / 2 ) - 100){
        setHomeMid();
      } 
    });  

    function setAnimB(left){
      $('.animB').css({left:left})
    }

    vm.scrollArrow = function(){
      var body = $("html, body");
      body.stop().animate({scrollTop:winHeight - 100}, 1000, 'swing');
    }

    $('.hmhg_circle').click(function(){
      var left = $(this).position().left + 60;
      var top = $(this).offset().top - 150;
      console.log(top);
      setAnimB(left);
      var body = $("html, body");
      body.stop().animate({scrollTop:top}, 1000, 'swing');
    });


    function setHomeMid(){
      $('.homeGraph').css({opacity:1}); 
    }



  })
  .controller('NavCtrl', function ($rootScope,$state,headerService) {  
    var vm = this;
    vm.state = $state;
    vm.btnClick = function(to){
      var toState = to;
      var fromState = $state.current.name;
      if(fromState != toState && !headerService.homeTopHead){
        if(fromState == 'home'){
          headerFade(10);
        }else if(toState == 'home'){
          headerFade(500);
        }
      }
    }

    vm.sideButton = function(){
      $rootScope.pageSide = true;
    }

    function headerFade(time) {
          $('.header').addClass('headerTransZero');
          $('.header').css({opacity:0});
          setTimeout(function(){
            $('.header').removeClass('headerTransZero');
            $('.header').css({opacity:1});
          },time);
    }
  })
  .controller('SideCtrl', function ($rootScope,$state,headerService) {  
    var vm = this;
    vm.tab = 1;
    vm.state = $state;
    vm.sideButton = function(){
      $rootScope.pageSide = false;
    }
    vm.logout = function(){
      $rootScope.pageSide = false;
      $state.go('logout');
    }
    vm.go = function(str){
      $rootScope.pageSide = false;
      $state.go(str);
    }

  })