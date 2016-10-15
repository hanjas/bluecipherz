'use strict';

/**
 * @ngdoc function
 * @name alFjrApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the alFjrApp
 */

angular.module('alFjrApp')
  .controller('SayHelloCtrl', function ($rootScope,$scope,$state,headerService) {  
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
    vm.inputClick = function(id){
    	if(id == 1){ vm.inp1Act = true;  }else
    	if(id == 2){ vm.inp2Act = true;  }else
    	if(id == 3){ vm.inp3Act = true;  }else
    	if(id == 4){ vm.inp4Act = true;  }
    }

    vm.checkInput = function(id){
    	if(id == 1){
	    	if(!angular.isDefined(vm.inp1) || vm.inp1 == ''){
	    		vm.inp1Act = false;
	    	}else{
	    		vm.inp1Act = true;
	    	}
    	}else
    	if(id == 2){
	    	if(!angular.isDefined(vm.inp2) || vm.inp2 == ''){
	    		vm.inp2Act = false;
	    	}else{
	    		vm.inp2Act = true;
	    	}
    	}else
    	if(id == 3){
	    	if(!angular.isDefined(vm.inp3) || vm.inp3 == ''){
	    		vm.inp3Act = false;
	    	}else{
	    		vm.inp3Act = true;
	    	}
    	}else
    	if(id == 4){
	    	if(!angular.isDefined(vm.inp4) || vm.inp4 == ''){
	    		vm.inp4Act = false;
	    	}else{
	    		vm.inp4Act = true;
	    	}
    	}
        if(vm.inp1Act&&vm.inp2Act&&vm.inp3Act&&vm.inp4Act){ 
            vm.errorMsg = "";
        }
    }

    vm.submitInput = function(){
        if(vm.inp1Act&&vm.inp2Act&&vm.inp3Act&&vm.inp4Act){
            $rootScope.pageBusy = true;
            fakeSubmition();
            vm.errorMsg = "";
        }else{
            vm.errorMsg = "Please fill all the fields";
        }
    }

    function fakeSubmition(){

        $rootScope.mbHead="SUCCESS";
        $rootScope.mbCont="Your Message has been successfully sent";
        $rootScope.mbBtn="Back to Home";
        $rootScope.mbClFunc = function(){
            $rootScope.mbShow = false;
            $state.go('home');
        }
        setTimeout(function(){
            $rootScope.mbShow = true;
            $rootScope.pageBusy = false;
            $scope.$apply(); 
        },2000);
    }



  })