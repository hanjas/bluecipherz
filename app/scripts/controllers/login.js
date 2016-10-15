'use strict';

/**
 * @ngdoc function
 * @name alFjrApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the alFjrApp
 */

angular.module('alFjrApp')
  .controller('LoginCtrl', function ($rootScope,$scope,$state,headerService,$timeout,TokenHandler,$cookieStore) {  
    var vm = this; 
    headerService.setAsNormalPage();


    vm.inputClick = function(id){
        if(id == 1){ vm.inp1Act = true;  }else
        if(id == 2){ vm.inp2Act = true;  }
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
        }
        if(vm.inp1Act&&vm.inp2Act){ 
            vm.errorMsg = "";
        }
    }

    vm.submitInput = function(){
        vm.checkInput(1);
        vm.checkInput(2);
        if(vm.inp1Act&&vm.inp2Act){
            vm.buttonBusy = true;
            Login(); 
            vm.errorMsg = "";
        }else{
            vm.buttonBusy = false; 
            vm.errorMsg = "Please fill all the fields";
        }
    }

    // vm.inp1 = 'waxx@bluroe.com';
    // vm.inp2 = 'nevergiveup';

    function Login(){

        vm.username = vm.inp1;
        vm.password = vm.inp2;
        TokenHandler.login(vm.username,vm.password,function(data){ 
            if(data.status == 200){
                var userData = data.data.user; 
                $rootScope.userData = userData;
                $cookieStore.put('userData',userData);
                $rootScope.loggedIn = true;
                vm.logProcess = true;
                $state.go('dashboard.home');    
            }else if(data.status == 401){
                $rootScope.loggedIn = false;
                vm.logProcess = false;
                vm.buttonBusy = false;
                vm.errorMsg = "Invalid username or password";
            }else{
                console.log(data);
            }
        })
    }

  }).controller('LogoutCtrl', function ($timeout,$scope,$rootScope,$state,$cookieStore) { 
        $cookieStore.remove('userData');
        $state.go('home');
        $rootScope.loggedIn = false;
  });