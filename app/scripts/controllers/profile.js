'use strict';

/**
 * @ngdoc function
 * @name alFjrApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the alFjrApp
 */

angular.module('alFjrApp')
  .controller('ProfileCtrl', function ($rootScope,$state,headerService,$cookieStore,TokenHandler,loginService,$resource) {  
    var vm = this;
    headerService.setPage();
    headerService.setAsNormalPage();
  	vm.user = $cookieStore.get('userData');
  	vm.userDataT = $cookieStore.get('userData');


    var op = $cookieStore.get('password');
  	


  	vm.checkField = function(id){
  		if(id==1){
	  		if(vm.userDataT.name == vm.user.name && vm.userDataT.position == vm.user.position && vm.userDataT.email == vm.user.email){
	  			vm.form1Active = true;
	  		}else{
	  			if(vm.user.name == '' || vm.user.email == '' || vm.user.position == '' || vm.user.email.length < 6){
	  				vm.form1Active = true;
	  			}else{
	  				vm.form1Active = false;
	  			}
	  		}
  		}else if(id==2){
  			if(vm.oldPass == '' || vm.newPass == '' || vm.confPass == '' || !angular.isDefined(vm.oldPass) || !angular.isDefined(vm.newPass) || !angular.isDefined(vm.confPass)){
  				vm.form2Active = true;
  			}else{
  				if(vm.oldPass.length > 5 && vm.oldPass == op && vm.newPass.length > 5 &&  vm.confPass.length > 5 && vm.newPass == vm.confPass){
  					vm.form2Active = false;
  				}else{
  					vm.form2Active = true;
  				}
  			}
  		}
  	}
  	vm.checkField(1);
  	vm.checkField(2);

  	function preventTab(e){
  		if(e.keyCode==9){
  			e.preventDefault();
  		}
  	}
  	vm.preventTab = function(e){
  		preventTab(e);
  	}

  	vm.saveF1 = function(){
		if(!vm.form1Active){
			saveBasicInfo();
		}  		
  	}

  	function saveBasicInfo(){ 
  	 	vm.form1Saving = true;
        var data = TokenHandler.wrapActions(
            $resource(loginService.host + '/profile_update'),
            { 'save':   {method:'POST'}, isArray:false}
        );  
        data.save(vm.user).$promise.then(function(results) { 
  	 		vm.form1Saving = false;
        	vm.user = results;
        	$cookieStore.put('email',results.email);
        	vm.userDataT = results;
        	$rootScope.userData = results;
        	$cookieStore.put('userData',results); 
  			vm.checkField(1);
        }); 
    } 

    vm.saveF2 = function(){
    	if(!vm.form2Active){
    		savePassword();
    	}
    }

    function savePassword(){
  	 	vm.form2Saving = true;
        var data = TokenHandler.wrapActions(
            $resource(loginService.host + '/profile_change_pass'),
            { 'save':   {method:'POST'}, isArray:false}
        );  
        data.save({id:vm.user.id,password:vm.newPass}).$promise.then(function(results) { 
  	 		vm.form2Saving = false; 
        	$cookieStore.put('password',results.password); 
  			vm.oldPass = '';
  			vm.newPass = '';
  			vm.confPass = '';
  			vm.checkField(2);
        }); 	
    }
  })