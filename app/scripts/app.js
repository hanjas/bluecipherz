'use strict';

/**
 * @ngdoc overview
 * @name alFjrApp
 * @description
 * # alFjrApp
 *
 * Main module of the application.
 */
angular  
  .module('alFjrApp', [
    'ngResource',
    'ui.router', 
    'ngCookies',
    'satellizer',
    'ngAnimate',
    'rzModule',
    'ngSanitize',
    'angular-svg-round-progressbar',
    'datePicker'
  ]) 
  .config(function ($locationProvider,$stateProvider,$urlRouterProvider, $authProvider) { 
      
      // Satellizer configuration that specifies which API
      // route the JWT should be retrieved from
      // $authProvider.loginUrl = 'http://api.blue.bluroe.com/api/authenticate';
      $authProvider.baseUrl = 'http://localhost:9000';
      $authProvider.loginUrl = 'http://api.blue.bluroe.com/api/authenticate';
      
      $urlRouterProvider.otherwise('/'); 
 
      $stateProvider
        // .state('home', {
        //   url: '/',
        //   templateUrl: 'views/home.html',
        //   controller: 'MainCtrl',
        //   controllerAs: 'main'
        // })
        // .state('works', {
        //   url: '/works',
        //   templateUrl: 'views/work.html',
        //   controller: 'WorkCtrl',
        //   controllerAs: 'work'
        // })
        // .state('pricing', {
        //   url: '/pricing',
        //   templateUrl: 'views/pricing.html',
        //   controller: 'PricingCtrl',
        //   controllerAs: 'pricing'
        // })
        // .state('say_hello', {
        //   url: '/say_hello',
        //   templateUrl: 'views/say_hello.html',
        //   controller: 'SayHelloCtrl',
        //   controllerAs: 'say'
        // })
        // .state('who_we_are', {
        //   url: '/who_we_are',
        //   templateUrl: 'views/who_we_are.html',
        //   controller: 'WhoWeAreCtrl',
        //   controllerAs: 'who'
        // })
        // .state('login', {
        //   url: '/login',
        //   templateUrl: 'views/login.html',
        //   controller: 'LoginCtrl',
        //   controllerAs: 'login'
        // })
        // .state('sign_up', {
        //   url: '/sign_up',
        //   templateUrl: 'views/sign_up.html',
        //   controller: 'LoginCtrl',
        //   controllerAs: 'login'
        // })
        // .state('logout', {
        //   url: '/logout', 
        //   controller: 'LogoutCtrl',
        //   controllerAs: 'login'
        // })
        // .state('dashboard', {
        //   abstract: true,
        //   url: '/dashboard',
        //   templateUrl: 'views/dashboard.html',
        //   controller: 'DashboardCtrl',
        //   controllerAs: 'dash'
        // }) 
        // .state('dashboard.home', {
        //   url: '',
        //   templateUrl: 'views/dashboard/home.html',
        //   controller: 'DashboardHomeCtrl',
        //   controllerAs: 'pm'
        // })
        // .state('dashboard.pro_manager', {
        //   url: '/project_manager',
        //   templateUrl: 'views/dashboard/projectManager.html',
        //   controller: 'ProjectManagerCtrl',
        //   controllerAs: 'pm'
        // }) 
        // .state('profile_edit', {
        //   url: '/profile/edit',
        //   templateUrl: 'views/profile.html',
        //   controller: 'ProfileCtrl',
        //   controllerAs: 'pro'
        // })
        .state('home', {
          url: '/',
          templateUrl: 'views/test.html',
          controller: 'testCtrl',
          controllerAs: 'main'
        })
        
  })
.run(function($rootScope, $location, $state, $stateParams, $cookieStore) {
  $rootScope.title = 'BCZ - IT Solutions';
  $rootScope.mbClick = function(callback){ callback(); }
  var state = false; 
  var restricted = false;
  var restrictedStates = ['dashboard','profile_edit'];
  $rootScope.$on( '$stateChangeStart', function(e, toState  , toParams , fromState, fromParams) { 
    $('.footer').hide(); 

    for(var i=0;i < restrictedStates.length;i++){
      if(toState.name == restrictedStates[i]){
        restricted = true;
      }
    } 
    var userData = $cookieStore.get('userData');   
    var isLogin = toState.name === "home";
    if(isLogin){
       return; // no need to redirect 
    }
    // now, redirect only not authenticated
    if(!angular.isDefined(userData) && restricted) {
        e.preventDefault(); // stop current execution
        $state.go('home'); // go to login
        restricted = false;
    }  

  });   


  if(angular.isDefined($cookieStore.get('userData'))){
    $rootScope.loggedIn = true;
    $rootScope.userData = $cookieStore.get('userData');
  }
});




$(function() {   
    jQuery.scrollSpeed(80, 800); 
});
  