'use strict';

/**
 * @ngdoc service
 * @name bluroeApp.powerprogress
 * @description
 * # powerprogress
 * Service in the bluroeApp.
 */
angular.module('alFjrApp')
    .service('headerService', function ($rootScope,$state,$timeout) {
      var vm = this;
        vm.bgSpeed = 0.4;
        vm.hTopHeight = 500; 
        var winHeight = $(window).height();
        var homeBG = false;
        function BGFade(){ 
            $('.homeBG').fadeOut(); 
        }
        function BGShow(){ 
            $('.homeBG').show(); 
        }
        vm.setHeader = function(){ 
          $('.header').addClass('headerBG');
        }
        vm.setScroll = function(){ 
            $(window).scroll(function(){ 
                vm.y = $(window).scrollTop();
                vm.y1 = vm.y * vm.bgSpeed * -1;
                $('.homeBG').css({top:vm.y1});

                $('.ht_gr').css({opacity: vm.y / (vm.hTopHeight-150) });

                vm.h1 = vm.y * 0.3;
                vm.h2 = vm.y * 0.1;
                vm.h3 = vm.y * 0;

                vm.h4 = vm.y * 1.8;

                $('.ht_logo').css({top:'calc( 40% - 100px - ' + vm.h1 +'px ) ' });
                $('.htl_big').css({top:'calc( 40% - 100px - ' + vm.h4 +'px ) ' });
                $('.ht_name').css({top:'calc( 40% + 20px - ' + vm.h2 +'px ) ' });
                $('.ht_desc').css({top:'calc( 40% + 65px - ' + vm.h3 +'px ) ' });

                // $('.ht_gr').css({height:winHeight + ( vm.y * 2 ) });

                if(vm.y > 255){
                  $('.scrollArrow').css({opacity:0});
                }else{
                  $('.scrollArrow').css({opacity:1});
                } 

                vm.hh = vm.hTopHeight - vm.y - 200;
                if(vm.hh <= 0 ){  
                  $('.header').css({top:0});
                  $('.ht_btnTop').removeClass('ht_btnTopFix');
                  $('.ht_btnSet').removeClass('ht_btnTopFix');
                  $('.ht_img').addClass('headerTransLow');
                  $('.ht_img').css({opacity:0}); 
                  vm.homeTopHead = true;
                }else{ 
                  $('.ht_btnTop').addClass('ht_btnTopFix');
                  $('.ht_btnSet').addClass('ht_btnTopFix');
                  $('.ht_img').removeClass('headerTransLow');
                  $('.ht_img').css({opacity:1}); 
                  $('.header').css({top:vm.hh});
                  vm.homeTopHead = false;
                }

                if(vm.hh + 100 <= 0 ){  
                  $('.header').addClass('headerBG');
                }else{ 
                  $('.header').removeClass('headerBG');
                }
              // if($state.current.name != 'home'){
              //   $('.header').css({top:0});
              // }

            });
        }
      var footerTime;
      vm.setPage = function(){
        $rootScope.noHeader = false;
        $rootScope.state = $state;
        $(window).scrollTop(10)
        BGShow();
        $(window).scrollTop(0)
        $rootScope.headerActive = true;
        clearTimeout(footerTime);
        footerTime = setTimeout(function(){ 
          $('.footer').css({opacity:1}); 
          $('.footer').show();
        },2000);


        $('.header').css({top:0});
      }
      vm.setHomePage = function(){
        $rootScope.noHeader = false;
        BGShow();
        clearTimeout(footerTime);
        footerTime = setTimeout(function(){ 
          $('.footer').css({opacity:1}); 
          $('.footer').show();
        },2000);
        $rootScope.state = $state;
        $(window).scrollTop(10)
        $(window).scrollTop(0) 
        // $('.footer').css({opacity:1}); 
        setTimeout(function(){
          // $rootScope.headerActive = true;
          $('.header').addClass('headerActTemp');
        },100);
      }
      vm.activeHeader = function(){
        $rootScope.headerActive = true;
      }
      vm.setAsNormalPage = function(not){  
        
        // this piece of coe referes to set page function
        $rootScope.state = $state;
        $(window).scrollTop(10)
        $(window).scrollTop(0)
        $rootScope.headerActive = true;
        clearTimeout(footerTime);
        if(not == 'admin'){ 
          $rootScope.noHeader = true;
          $rootScope.halfViewPort = true;
        }else if(not != 'footer'){
          footerTime = setTimeout(function(){ 
            $('.footer').css({opacity:1}); 
            $('.footer').show();
          },2000);
        }
          vm.hTopHeight = 0 ; 
        vm.setScroll();
        vm.setHeader(); 
        BGFade();
      }
      vm.homeTopHead = true;
    });
