'use strict';

/**
 * @ngdoc function
 * @name alFjrApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the alFjrApp
 */

angular.module('alFjrApp')
  .controller('DashboardCtrl', function ($rootScope,$scope,$state,headerService) {  
    var vm = this; 
    vm.state = $state;
    headerService.setAsNormalPage('footer');
    vm.gotoState = function(state){
        $state.go(state);
    }

})
  .controller('DashboardHomeCtrl', function ($rootScope,$scope,$state,headerService,$cookieStore,TokenHandler,$interval,$timeout,$resource,loginService,$filter,projectFactory) {  
    var vm = this;  
    headerService.setPage();
    headerService.setAsNormalPage('admin');  
 

})
  .controller('FeedCtrl', function ($rootScope,$scope,$state,headerService,feedFactory,$cookieStore,loginService,TokenHandler,$resource,$filter) {  
    var vm = this; 
    var user = $cookieStore.get('userData');
 
    vm.checkCommentBox = function(data){
        if(!angular.isDefined(data.comment) || data.comment == ''){
            data.cmtBox = false;
        }else{
            data.cmtBox = true;
        }
    }

    var interval,timeout,ref,fetch;
    vm.refresh = function(){ 
        vm.refreshing = true;
        ref = false;
        clearTimeout(timeout);
        clearInterval(interval); 

        setPage();     

        timeout = setTimeout(function() {
            ref = true;
        }, 800);
        interval = setInterval(function(){
            if(ref&&vm.feedFetch){ 
                vm.refreshing = false;
                $scope.$apply();
                clearInterval(interval);
            }
        },100);
    }

    vm.feedOption = function(data){
        if(data.option){
            data.option = false;
        }else{
            data.option = true;
        }
    } 
    function getFeeds(){
        vm.feedFetch = false;
        feedFactory.fetchFeeds(function(data){
            vm.feeds = data;
            for(var i=0;i < data.length ;i++){
                vm.feeds[i].updated = moment.utc(data[i].updated_at).format('MMM d - hh mm a');  // fix this ------------------------------------------------------------<<<<
                for(var j=0;j < data[i].comments.length ;j++){
                    vm.feeds[i].comments[j].updated = moment.utc(data[i].comments[j].updated_at).format('hh mm a'); 
                }
            } 
            vm.feedFetch = true;
        });
    }

    function setPage(){
        getFeeds(); 
    }

    vm.postComment = function(feed){
        var params = {
            user_id:user.id,
            feed_id:feed.id,
            comment:feed.comment,
        } 
        if(angular.isDefined(feed.comment) || feed.comment != ''){
            putComment(params,feed);
        }
    }
    function putComment(data,feed){
        feed.commentPosting = true;  
        feed.cmtBox = false;
        var Comment = TokenHandler.wrapActions(
            $resource(loginService.host + '/comments'),
            { 'save':   {method:'POST'}, isArray:false}
        );  
        Comment.save(data).$promise.then(function(results) {
            feed.commentPosting = false;  
            setCommentBox(feed); 
            data.name = user.name; 
            results.name= data.name;
            feed.comments.push(results); 
        }); 
    } 

    vm.removeFeedRequest = function(data){
        vm.selectedFeed = data;
        vm.delConfVar = true;
        vm.popup_message = 'Do you want to delete the post "'+ data.description +'" ?';
    }

    vm.removeFeed = function(data){
        if(data == 1){
            var input = vm.selectedFeed.id;
            vm.delConfVar = false;
            feedFactory.removeFeed(input,function(data){
                hideFeed(vm.selectedFeed.id);
            });
        }else{
            vm.delConfVar = false;
        }
    }
    vm.removeCommentRequest = function(feed,data){
        vm.selectedComment = data;
        vm.selectedFeed = feed;
        vm.delConfVar = true;
        vm.popup_message = 'Do you want to delete the comment "'+ data.comment +'" ?';
    }

    vm.removeComment = function(data){
        if(data == 1){
            vm.delConfVar = false; 
            var input = vm.selectedComment.id;
            var comment = TokenHandler.wrapActions(
                $resource(loginService.host + '/comments'),
                { 'delete':   {method:'DELETE'}, isArray:false}
            );  
            comment.delete({id:input}).$promise.then(function(results) {
                var i = 0;
                for(i = 0;i < vm.selectedFeed.comments.length ;i++){
                    if(vm.selectedFeed.comments[i].id == input){
                        vm.selectedFeed.comments[i].deleted = true;
                    }
                }
            }); 
        }else{ 
            vm.delConfVar = false;
        }
    }

    function hideFeed(id){
        var i = 0;
        for(i = 0;i < vm.feeds.length ;i++){
            if(vm.feeds[i].id == id){
                vm.feeds[i].deleted = true;
            }
        }
    }

    // function hideComment(data,id){
    //     var i = 0;
    //     for(i = 0;i < data.length ;i++){
    //         if(data[i].id == id){
    //             data[i].deleted = true;
    //         }
    //     }
    // }

    function setCommentBox(data){
        data.comment = '';
    }
    setPage();


    function getTimeDiff(start, end){
        var h = parseInt(moment.utc(moment(end).diff(moment(start))).format("HH"))
        var m = parseInt(moment.utc(moment(end).diff(moment(start))).format("mm"))
        var s = parseInt(moment.utc(moment(end).diff(moment(start))).format("ss"))

        console.log(h + ' ' + m + ' ' + s);
    }
})
  .controller('WPartnerCtrl', function ($rootScope,$scope,$state,headerService,$filter,$interval,$cookieStore,TokenHandler,$resource,loginService,projectFactory) {  
    var vm = this; 
    vm.startWork = function(){
        if(vm.working == 0){
            if(vm.selectedWork.id != 0){
                startWork();
                finishWorking(0);
            }
        }else if(vm.working == 2){
            stopWork();
        }else if(vm.working == 3){
            finishWorking(1);
        }
    }
    var workStarted = Date.now();
    var millis = 0;
    var whEle = document.getElementById('dbwprrr_wh');
    var workHours; 
    var workHourCounter; 
    var userData = $cookieStore.get('userData');

    vm.workList = [];

    function getProjects(){
        vm.proFetch = false;
        vm.workList = [];
        projectFactory.getProjects(function(data){
            vm.workList = data;
            for(var i=0;i<vm.workList.length;i++){
                vm.workList[i].start_date = new Date(vm.workList[i].start_date);
                vm.workList[i].deadline = new Date(vm.workList[i].start_date);
            } 
            vm.proFetch = true;
        });
    }


    function setPage(){ 
        if(angular.isDefined($cookieStore.get('selectedWork')) && $cookieStore.get('selectedWork') != 0){ 
            vm.selectedWork = $cookieStore.get('selectedWork');
        }else{
            vm.selectedWork = {id:0};     
            $cookieStore.put('selectedWork',vm.selectedWork); 
        }
        if(angular.isDefined($cookieStore.get('working'))){
            if($cookieStore.get('working') == 2){
                vm.working = $cookieStore.get('working');
                startWork();
            }else{
                vm.working = 0;
                $cookieStore.put('working',vm.working); 
            }
        }else{ 
            vm.working = 0;
            $cookieStore.put('working',vm.working); 
        }
        getProjects();
        vm.descErr = false;
        vm.desc = '';   
        vm.fworkPosting = false;
    }
 
    var interval,timeout,ref,fetch;
    vm.refresh = function(){
        ref = false;
        vm.refreshing = true;
        clearTimeout(timeout);
        clearInterval(interval); 

        setPage();     

        timeout = setTimeout(function() {
            ref = true;
        }, 2000);
        interval = setInterval(function(){
            if(ref&&vm.proFetch){ 
                vm.refreshing = false;
                $scope.$apply();
                clearInterval(interval);
            }
        },100);
    }

    vm.selectWork = function(data){
        vm.selectedWork = data;     
        $cookieStore.put('selectedWork',vm.selectedWork); 
    }

    function startWork(){
        if(vm.selectedWork.id != 0){
            vm.working = 1; 
            $cookieStore.put('working',vm.working);
            if(angular.isDefined($cookieStore.get('workStarted'))){
                workStarted = $cookieStore.get('workStarted');
            }else{
                workStarted = Date.now();
                $cookieStore.put('workStarted',workStarted) ;
            }
            vm.workStarted = $filter("date")(workStarted, 'hh:mm a'); 
            clearInterval(workHourCounter);
            millis=0;
            workHourCounter = setInterval(function(){ 
                if(millis == 0){
                    workHours = timediff(workStarted,Date.now()); 
                }
                whEle.innerHTML = workHours  + ' 0' + millis;
                millis++;
                if(millis==10){
                    millis=0;
                }
            },100);
            setTimeout(function(){
                vm.working = 2;
                $cookieStore.put('working',vm.working);
                $scope.$apply();
            },500); 
        }
    }
    function stopWork(){
        vm.working = 1;
        $cookieStore.put('working',vm.working);
        clearInterval(workHourCounter);
        vm.workStarted='';
        millis=0;
        whEle.innerHTML = '';
        $cookieStore.put('workStarted',undefined);
        setTimeout(function(){
            vm.working = 3;
            $scope.$apply();
        },500);
    }
    function finishWorking(id){ 
        var status;
        var description;
        var allow = true;

        if(id != 0){
            if(!angular.isDefined(vm.desc) || vm.desc == ''){
                allow = false;
            }
        }

        if(!allow){
            vm.descErr = true;
        }else{
            if(id==0){
                status = 'WORKING';
                description = 'Just Started working';
            }else{
                status = 'FINISHED';
                description = vm.desc;
            }
            var i,t,fetch;
            var whf = new Date(workStarted).getTime();
            var wht = new Date().getTime();
            vm.date = $filter("date")(Date.now(), 'MM-dd-yyyy');

            // moment("12/25/1995", "MM-DD-YYYY");

 
            var params = {
                description:description,
                wht:wht,
                whf:whf,
                project_id:vm.selectedWork.id,
                status:status,
                date:vm.date, 
                user_id:userData.id
            }   
            if(id==0){
                putReports(params);
            }else{
                finishReports(params);
                vm.working = 1;
                $cookieStore.put('working',vm.working);
                $cookieStore.put('selectedWork',undefined);
                clearTimeout(t);
                clearInterval(i);
                t = setTimeout(function(){
                    fetch = true; 
                },100);   
                i = setTimeout(function(){
                    if(fetch&&vm.fworkPosting){
                        setPage(); 
                        $scope.$apply();
                    }
                },500);   
            }
        }
    }


    function putReports(data){
        var Report = TokenHandler.wrapActions(
            $resource(loginService.host + '/reports'),
            { 'save':   {method:'POST'}, isArray:false}
        );  
        Report.save(data).$promise.then(function(results) {
            vm.fworkPosting = true; 
            $cookieStore.put('reportId',results); 
        }); 
    }

    function finishReports(data){
        var id = $cookieStore.get('reportId').id;
        var Report = TokenHandler.wrapActions(
            $resource(loginService.host + '/reports/'+id),
            { 'save':   {method:'POST'}, isArray:false}
        );  
        Report.save(data).$promise.then(function(results) { 
            vm.fworkPosting = true;
        }); 
    }

    function timediff(start, end){
        return moment.utc(moment(end).diff(moment(start))).format("HH:mm:ss")
    }
    setPage(); 


})
  .controller('ReportCtrl', function ($rootScope,$scope,$state,headerService,$cookieStore,TokenHandler,$resource,loginService,$filter) {  
    var vm = this;  
 
    vm.buttonState = 0;
    vm.selectedRow = {id:0}; 

    var userData = $cookieStore.get('userData');
    vm.post = function(){

        if(vm.buttonState == 0){

            

            var whf = new Date(vm.whf).getTime();
            var wht = new Date(vm.wht).getTime();

            vm.p1 = vm.p2 = vm.p3 = vm.p4 = true;
            // timediff(wh_from,wh_to);

            var params = {
                description:vm.desc,
                wht:wht,
                whf:whf,
                date:vm.date,
                user_id:userData.id
            }
            if( angular.isDefined(vm.desc) && vm.desc != ''){ vm.p1 = false }else{ vm.p1 =true;  }
            if( angular.isDate(vm.date)){ vm.p2 = false }else{ vm.p2 =true }
            if( angular.isDate(vm.whf)){ vm.p3 = false }else{ vm.p3 =true }
            if( angular.isDate(vm.wht)){ vm.p4 = false }else{ vm.p4 =true }

            if(!vm.p1&&!vm.p2&&!vm.p3&&!vm.p4){  
                putReports(userData.id,params);
                vm.buttonState = 1;
                $('.dbrr_posting').fadeIn(500);

                vm.p1 = vm.p2 = vm.p3 = vm.p4 = false;
            }else{
                vm.error = "Please fill the required fields";
            }
        
        }else if(vm.buttonState == 2){
            $('.dbrr_posting').fadeOut(500);
            vm.buttonState = 0;
            vm.rep_add = false;
        }
    }
    function postingSuccess(){
        getReports();
        setPage();
        vm.buttonState = 2;
    }
    function removingSuccess(){
        getReports();
        setPage();
    }

    function setPage(){
        vm.date = new Date();
        var time = $filter("date")(Date.now(), 'MM-dd-yyyy');
        vm.whf = vm.wht = new Date(time);
        vm.desc = '';
        vm.error = '';
        vm.selectedRow = {id:0};
    }

     
    var params = {};
    var fetching;
    function getReports(){
        vm.refreshing = true;
        var date = $filter("date")(Date.now(), 'MM-dd-yyyy');
        var ref = false;
        var fetch = false;
        var interval,timeout;
        var Report = TokenHandler.wrapActions(
            $resource(loginService.host + '/reports_by_day/'+date),
            ['query']
        );  
        Report.query(params).$promise.then(function(results) {
            vm.pageData = results;  
            fetch = true;
        }); 

        clearTimeout(timeout);
        clearInterval(interval);
        timeout = setTimeout(function(){
            ref = true;
        },2000);
        interval = setInterval(function(){
            if(ref&&fetch){
                vm.refreshing = false;
                $scope.$apply();
                clearInterval(interval);
            } 
        },10);
    }


    function putReports(id,data){
        var Report = TokenHandler.wrapActions(
            $resource(loginService.host + '/reports'),
            { 'save':   {method:'POST'}, isArray:false}
        );  
        Report.save(data).$promise.then(function(results) {
                postingSuccess();
        }); 
    }

    vm.refresh = function(){
        if(!vm.refreshing){
            setPage();
            getReports();
        }
    }
    vm.selectRow = function(data){
        vm.selectedRow = data; 
    }

    vm.delConf = function(action){
        if(action == 1){
            if(vm.selectedRow.id != 0){
                remReport(vm.selectedRow.id);
                vm.delConfVar = false;
                // $('.dbrpp_1').fadeOut(300);
            }
        }else{
            vm.delConfVar = false;
            // $('.dbrpp_1').fadeOut(300);
            vm.selectedRow = {id:0};
        }
    }

    vm.removeRow = function(){ 
        if(vm.selectedRow.id != 0){
            vm.delConfVar = true;
            // $('.dbrpp_1').fadeIn(300);
        }
    }

    function remReport(input){
        var Report = TokenHandler.wrapActions(
            $resource(loginService.host + '/reports/'+input),
            { 'delete':   {method:'DELETE'}, isArray:false}
        );  
        Report.delete({id:input}).$promise.then(function(results) {
                removingSuccess(); 
        }); 
    }

    function timediff(start, end){
        return moment.utc(moment(end).diff(moment(start))).format("hh mm")
    }


    getReports();
    setPage();

  })
