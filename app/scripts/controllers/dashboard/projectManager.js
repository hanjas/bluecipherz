angular.module('alFjrApp')
  .controller('ProjectManagerCtrl', function ($rootScope,$scope,$state,headerService,$cookieStore,TokenHandler,$interval,$timeout,$resource,loginService,$filter,projectFactory) {  
    var vm = this;  
    vm.workList = [];
    vm.proDetailsC = { doc_id:0 ,status:'INACTIVE',completed:false,progress:0};
    vm.allFilled = false;
    vm.message = {show:false,buttons:{yes:false,no:false,cancel:false}}
    vm.user = $cookieStore.get('userData');

    vm.scene = 1;
    vm.scene1 = 1;
    vm.scene2 = 1;
 
    function getProjects(){
        vm.proFetch = false;
        projectFactory.getProjects(function(data){
            vm.workList = data;
            vm.proFetch = true;
            console.log(data);
        });
    }

    vm.checkFeild = function(){ 
        if(angular.isDefined(vm.proDetailsC.name) && angular.isDefined(vm.proDetailsC.description) && angular.isDefined(vm.proDetailsC.platform)
            && vm.proDetailsC.description != '' && vm.proDetailsC.name != ''){
            vm.allFilled = true;
        }else{
            vm.allFilled = false;
        }  
    }   

    vm.createProject = function(){ 
        if(vm.allFilled && !vm.landingBusy){ 
            vm.creatingProject = true;
            vm.proDetailsC.start_date = Date.now();
            vm.proDetailsC.finish_date = '0';
            vm.proDetailsC.user_id = vm.user.id;
            vm.proDetailsC.deadline = moment(Date.now()).add(20,'days');
            var Project = TokenHandler.wrapActions(
                $resource(loginService.host + '/projects'),
                { 'save':   {method:'POST'}, isArray:false}
            );  
            Project.save(vm.proDetailsC).$promise.then(function(results) { 
                vm.creatingProject = false; 
                // console.log(results);
                vm.workList.push(results);
                vm.selectProject(results);

                vm.proDetailsC.name = '';
                vm.proDetailsC.description = '';
                vm.proDetailsC.platform = '';
            });    
        }
    }

    function makeSC2_1(){ 
        vm.slider.options.disabled = vm.priority.options.disabled = false;
        
    }

    function makeSC2_2(){ 
        vm.slider.options.disabled = vm.priority.options.disabled = true;

    }

    vm.changeScene = function(id){
        if(id==2){ // scene 2 edit mode
            if(vm.user.level>0){
                vm.scene = 2;
                vm.scene2 = 1;
                makeSC2_1();
            }else{
                showNotAuth();
            }
        }else if(id==3){ // scene 2 work mode
            if(vm.user.level>=0){
                vm.scene = 2;
                vm.scene2 = 2;
                makeSC2_2();
            }else{
                showNotAuth();
            }
        }
    }

    vm.scene1NotAuthMess = false;
    var SNA_TO;
    function showNotAuth(){
        vm.scene1NotAuthMess = true;
        if(angular.isDefined(SNA_TO)){
            $timeout.cancel(SNA_TO);
        }
        SNA_TO = $timeout(function() {
            vm.scene1NotAuthMess = false;
        }, 3000);
    }

    vm.sc1bTemp = {pu:[]};

    var pd_start_date = 0;
    var pd_finish_date = 0;
    var pd_deadline = 0;
    var pd_progress = 0;
    var pd_completed = 0;

    vm.selectProject = function(data){  
        if(!vm.landingBusy){ 
            vm.landingBusy = true;

            data.start_date = new Date($filter('date')(data.start_date));
            data.start_finish = new Date($filter('date')(data.finish_date));
            data.deadline = new Date($filter('date')(data.deadline));

            pd_start_date = data.start_date;
            pd_finish_date = data.finish_date;
            pd_deadline = data.deadline;  
            pd_completed = data.completed;

            vm.projectDetails = data;  
            console.log(data);
            if(data.p_users.length > 0){
                for(var i=0;i<data.p_users.length;i++){ 
                    if(data.p_users[i].owner){ 
                        vm.projectDetails.owner = data.p_users[i];
                    }
                }
            }else{
                vm.projectDetails.user = vm.user;
            } 
            for(var i=0;i<vm.users.length;i++){
                vm.users[i].pu_id = -1;
                vm.users[i].level =  0; 
            }
            vm.user.pu_id = -1;
            vm.user.level =  0;  
            var tempPUArr = [];
            tempPUArr = $.map(vm.projectDetails.p_users, function(value, index) {
                return [value];
            });

            vm.projectDetails.p_users = tempPUArr;

            for(var i=0;i<vm.users.length;i++){
                for(var j=0;j<vm.projectDetails.p_users.length;j++){   
                    if(vm.users[i].id == vm.projectDetails.p_users[j].user_id){ 
                        vm.users[i].level = vm.projectDetails.p_users[j].level;
                        vm.users[i].pu_id = vm.projectDetails.p_users[j].id; 
                        // console.log(vm.projectDetails.p_users[i]);
                        if(vm.projectDetails.p_users[j].user_id == vm.user.id){ 
                            vm.user.level =  vm.projectDetails.p_users[j].level;
                            vm.user.pu_id = vm.projectDetails.p_users[j].id;  
                        } 
                    }
                } 
            }  
            var tempObj;
            vm.sc1bTemp = {pu:[]};
            for(var i=0;i<vm.users.length;i++){
                tempObj = {}
                tempObj.id = vm.users[i].id;
                tempObj.pu_id = vm.users[i].pu_id;
                tempObj.level = vm.users[i].level;
                vm.sc1bTemp.pu.push(tempObj);
            }  
            getProData(function(){
                vm.projectSelected = true;
                vm.landingBusy = false; 
                setProgress(vm.projectData.progress,2000,800);
            });
        }
    } 

    var sc1b_userArray = []

    vm.saveSC1B_API={ buzy:false,pro:0,pro_len:0,progress:0,saving:false}
    vm.pd_temp_com;
    vm.SC1B_ch_date = function(id){
        if(vm.user.level < id){
            showNotAuth();
        }
    }
    vm.SC1B_userL = function(user,id){
        if(vm.user.level > 1){ 
            if(!vm.saveSC1B_API.buzy){
                user.level = id;
            }
        }else{
            showNotAuth();
        }
    }
    vm.SC1B_comChange = function(){
        if(vm.user.level > 1){
            if(!vm.saveSC1B_API.buzy){
                if(vm.projectDetails.completed == true){
                    vm.projectDetails.completed = vm.pd_temp_com;
                }else{
                    vm.pd_temp_com = vm.projectDetails.completed;
                    vm.projectDetails.completed = true;
                }
            } 
        }else{
            showNotAuth();
        }
    } 

    vm.pd_isChanged = false;

    function isSC1BChanged(){ 
        var tempObj;
        sc1b_userArray = []; 
        for(var i=0;i<vm.sc1bTemp.pu.length;i++){  
            if(vm.sc1bTemp.pu[i].id == vm.users[i].id){
                if(vm.sc1bTemp.pu[i].level != vm.users[i].level){  
                    tempObj = {};
                    if(vm.users[i].pu_id >= 0){ 
                        tempObj.id = vm.users[i].pu_id;
                    }
                    tempObj.user_id = vm.users[i].id;
                    tempObj.project_id = vm.projectDetails.id;
                    tempObj.level = vm.users[i].level;
                    tempObj.owner = false;
                    tempObj.validity = moment(Date.now()).add(999,'days');
                    sc1b_userArray.push(tempObj); 
                    vm.sc1bTemp.pu[i].level = vm.users[i].level; 
                } 
            }
        }
        if( pd_completed != vm.projectDetails.completed ||
            pd_start_date != vm.projectDetails.start_date ||
            pd_finish_date != vm.projectDetails.finish_date ||
            pd_progress != vm.projectData.progress ||
            pd_deadline != vm.projectDetails.deadline
            )
        { 
            pd_completed = vm.projectDetails.completed;
            pd_start_date = vm.projectDetails.start_date;
            pd_finish_date = vm.projectDetails.finish_date;
            pd_deadline = vm.projectDetails.deadline;
            pd_progress = vm.projectData.progress;
            vm.pd_isChanged = true; 
        }else{
            vm.pd_isChanged = false;
        } 
    }

    vm.saveSC1B = function(callback){ 
        isSC1BChanged();
        var SC1B_TO = {};
        if(sc1b_userArray.length>0 || vm.pd_isChanged){
            vm.saveSC1B_API.buzy = true;
            vm.saveSC1B_API.pro_len = sc1b_userArray.length;
            vm.saveSC1B_API.pro = 0;    
            vm.saveSC1B_API.saving = true;
            if(vm.pd_isChanged){
                vm.saveSC1B_API.pro_len++; 
                SC1B_TO.id = vm.projectDetails.id;
                SC1B_TO.description = vm.projectDetails.description;
                SC1B_TO.name = vm.projectDetails.name;
                SC1B_TO.doc_id  = vm.projectDetails.doc_id;
                SC1B_TO.status  = vm.projectDetails.status;
                SC1B_TO.start_date   = new Date(vm.projectDetails.start_date);
                SC1B_TO.deadline  = new Date(vm.projectDetails.deadline);
                SC1B_TO.status  = vm.projectDetails.status;
                SC1B_TO.platform  = vm.projectDetails.platform;
                SC1B_TO.completed = vm.projectDetails.completed; 
                SC1B_TO.progress = vm.projectData.progress;  
                if(angular.isDefined(vm.projectDetails.finish_date)){
                    SC1B_TO.finish_date   = new Date(vm.projectDetails.finish_date);
                }else{
                    SC1B_TO.finish_date = '0';
                }
                var sc1bP = TokenHandler.wrapActions(
                    $resource(loginService.host + '/projects_update'),
                    { 'save':   {method:'POST'}, isArray:false}
                );   
                sc1bP.save(SC1B_TO).$promise.then(function(results) {
                    vm.saveSC1B_API.pro++; 
                });   
                // console.log(SC1B_TO);
            } 
            for(var i=0;i<sc1b_userArray.length;i++){ 
                var PU = TokenHandler.wrapActions(
                    $resource(loginService.host + '/project_users'),
                    { 'save':   {method:'POST'}, isArray:false}
                );  
                PU.save(sc1b_userArray[i]).$promise.then(function(results) {
                    vm.saveSC1B_API.pro++;  
                });   
            } 
            var saveSC1B_API_inter = $interval(function(){ 
                if(vm.saveSC1B_API.pro / vm.saveSC1B_API.pro_len * 100 < 10){
                    vm.saveSC1B_API.progress = 10;  
                }else{
                    vm.saveSC1B_API.progress = vm.saveSC1B_API.pro / vm.saveSC1B_API.pro_len * 100;
                } 
                if(vm.saveSC1B_API.pro == vm.saveSC1B_API.pro_len){
                    $interval.cancel(saveSC1B_API_inter);
                    vm.saveSC1B_API.buzy=false;
                    vm.saveSC1B_API.pro=0;
                    vm.saveSC1B_API.pro_len=0;  
                    $timeout(function(){
                        vm.saveSC1B_API.progress = 0;
                        vm.saveSC1B_API.saving = false; 
                        if(angular.isDefined(callback)){
                            callback();
                        }
                    },1500);
                }
            },100);
        }else{
            if(angular.isDefined(callback)){
                callback();
            } 
        } 
    }

    vm.closeEditWindow = function(){
        if(!vm.taskAPIBusy){ 
            disableAll();
            if(!vm.navTaskCreate){
                checkObjChanged(function(){
                    closeWindActions();
                });
            }else{
                closeWindActions();
            }
        }
    }

    vm.mainProDur = 3000;
    vm.mainProAD = 800;

    function closeWindActions(){
        vm.scene = 1;
        vm.scene1 = 1; 
        vm.scene2 = 1;  
        // vm.navItem = {duration:0,assigned_to:2,progress:0};
        var tempPP = vm.projectData.progress; 
        setProgress(vm.projectData.progress,2000,800);
        vm.mainProDur = 0; 
        vm.mainProAD = 0;
        vm.projectData.progress = 0; 
        $timeout(function() {
            vm.mainProAD = 800;
            vm.mainProDur = 3000;
            vm.projectData.progress = tempPP; 
        }, 10);
        enableAll();
        vm.pathNavigate(0);
        vm.SC1B_delReq= false;
    }

    vm.deleteProject = function(){
        if(vm.user.level > 2){ 
            vm.saveSC1B_API.buzy = true; 
            var sc1bdel = TokenHandler.wrapActions(
                $resource(loginService.host + '/projects'),
                { 'delete':   {method:'POST'}, isArray:false}
            );  
            sc1bdel.delete({id:vm.projectDetails.id}).$promise.then(function(results) {
                vm.saveSC1B_API.buzy = false;
                console.log('project deleted'); 
                vm.closeProject();
            });   
        }
    }

    vm.projectSettings = function(){ 
        if(vm.user.level>0){
            if(vm.scene1 == 1){
                vm.scene1 = 2; 
                vm.SC1B_delReq= false;
            }else{
                vm.scene1 = 1;
                vm.SC1B_delReq= false;
            }
        }else{
            showNotAuth();
        }
    }

    vm.closeProject = function(){ 
        if(!vm.taskAPIBusy){ 
            vm.saveSC1B(function(){ 
                vm.projectSelected = false;
                vm.projectDetails = undefined; 
                vm.levelLength = 0; 
                vm.navData = {tasks:[],taskbags:[]}; 
                vm.navPath = [];
                vm.navPathNameArr = [];
                vm.navPathName = '';
                vm.projectData.progress = 0; 
                vm.scene = 1; 
                vm.scene1 = 1; 
                vm.scene2 = 1; 
                getProjects();
                vm.SC1B_delReq= false;
            });
        } 
    } 

    function fullScreen(){ 
        var el = document.documentElement,  
        rfs = el.requestFullScreen
        || el.webkitRequestFullScreen
        || el.mozRequestFullScreen;
        rfs.call(el);
    }

    vm.projectData = {taskbags:[],tasks:[]}; 

    function findTopLevel(){
        var level = 0;
        for(var i=0; i< vm.taskD.length; i++){
            if(vm.taskD[i].level > level){
                level = vm.taskD[i].level;
            }
        }
        for(var i=0; i< vm.taskbagD.length; i++){
            if(vm.taskbagD[i].level > level){
                level = vm.taskbagD[i].level;
            }
        } 
        return level;
    }  

    function makeData(){
        var levels = [];
        var level = findTopLevel();
        vm.levelLength = level;
        var i = level; 
        while(i>=0){
            levels[i] = findArrayByLevel(i); 
            i--;
        }
        return levels;
    } 
 
    function alignData(){
        var levels = makeData(); 
        var pidTemp = 0;
        var levelsAligned = [];
        for(var i=vm.levelLength;i>0;i--){ 
            levelsAligned[i] = [];
            for(var j=0; j < levels[i].tasks.length; j++){ // for tasks
                pidTemp = levels[i].tasks[j].parent_id;
                // making sure things are there
                if(!angular.isDefined(levelsAligned[i][pidTemp])){ 
                    levelsAligned[i][pidTemp] = {};
                }
                if(!angular.isDefined(levelsAligned[i][pidTemp].tasks)){
                    levelsAligned[i][pidTemp].tasks = [];
                }
                if(!angular.isDefined(levelsAligned[i][pidTemp].taskbags)){
                    levelsAligned[i][pidTemp].taskbags = [];
                }
                // pushing
                levelsAligned[i][pidTemp].tasks.push(levels[i].tasks[j]); 
            }
            for(var j=0; j < levels[i].taskbags.length; j++){ // for tasks
                pidTemp = levels[i].taskbags[j].parent_id;
                // making sure things are there
                if(!angular.isDefined(levelsAligned[i][pidTemp])){ 
                    levelsAligned[i][pidTemp] = {};
                }
                if(!angular.isDefined(levelsAligned[i][pidTemp].taskbags)){
                    levelsAligned[i][pidTemp].taskbags = [];
                }
                if(!angular.isDefined(levelsAligned[i][pidTemp].tasks)){
                    levelsAligned[i][pidTemp].tasks = [];
                }
                //pushing
                levelsAligned[i][pidTemp].taskbags.push(levels[i].taskbags[j]); 
            }
        }
        return levelsAligned;
    }

    var proDataFetched = false;

    function reorderingData(){
        var alData = alignData();
        var mData = makeData(); 
        var tempData;
        var pidTemp = 0;  
        if(vm.levelLength > 0 && angular.isDefined(alData[vm.levelLength])){
            for(var i=0;i<alData[vm.levelLength].length;i++){ 
                if(angular.isDefined(alData[vm.levelLength][i])){
                    for(var j=0;j<alData[vm.levelLength][i].taskbags.length;j++){
                        alData[vm.levelLength][i].taskbags[j].content = {tasks:[],taskbags:[]};
                        alData[vm.levelLength][i].taskbags[j] = addProp(alData[vm.levelLength][i].taskbags[j]);
                    }
                }
            }
            for(var i = vm.levelLength-1;i>0;i--){
                for(var u=0;u < alData[i].length;u++){
                    if(angular.isDefined(alData[i][u])){
                        for(var j=0;j < alData[i][u].taskbags.length;j++){
                            pidTemp = alData[i][u].taskbags[j].id;
                            if(angular.isDefined(alData[i+1][pidTemp])){
                                alData[i][u].taskbags[j].content = alData[i+1][pidTemp];
                                alData[i][u].taskbags[j] = addProp(alData[i][u].taskbags[j]);
                            }else{
                                alData[i][u].taskbags[j].content = {tasks:[],taskbags:[]};
                                alData[i][u].taskbags[j] = addProp(alData[i][u].taskbags[j]);
                            }
                        }
                    }
                }
            }
            tempData = mData[0];
            for(var i=0; i < tempData.taskbags.length;i++){
                pidTemp = tempData.taskbags[i].id; 
                if(angular.isDefined(alData[1][pidTemp])){
                    tempData.taskbags[i].content = alData[1][pidTemp];
                    tempData.taskbags[i] = addProp(tempData.taskbags[i]);
                }else{
                    tempData.taskbags[i].content = {tasks:[],taskbags:[]};    
                    tempData.taskbags[i] = addProp(tempData.taskbags[i]);
                }
            }
        }else{
            tempData = mData[0];
            for(var i=0;i<tempData.taskbags.length;i++){
                tempData.taskbags[i].content = {tasks:[],taskbags:[]}
                tempData.taskbags[i] = addProp(tempData.taskbags[i]);
            } 
        }
        tempData = addProp(tempData);
        if(!proDataFetched){
            pd_progress = tempData.progress;
            proDataFetched = true;
        }
        console.log(tempData);
        return tempData;
    } 

    vm.pro_progress = 0;

    function setProgress(n,delay,pre){
        vm.pro_progress = 0;
        var de = ( delay/n ) * 0.7 ;
        if(n <= 100){ 
            setTimeout(function(){
                var inter = $interval(function(){
                    vm.pro_progress++;
                    if(vm.pro_progress >= n){
                        $interval.cancel(inter); 
                        vm.pro_progress = parseInt(n);
                    }
                },de);
            },pre)
        }else{
          vm.pro_progress = 0;
        }
    }

    function dateDiff(end,start){ 
        var mom = moment(moment(end).diff(moment(start)));
        var d = parseInt(mom.format('DD')) - 1;
        var m = parseInt(mom.format('MM')) - 1;
        var y = parseInt(mom.format('YYYY')) - 1970;
        return {d:d,y:y,m:m}
    }

    function addProp(data){  
        var type = 0; // type 0 = top , type 1 = rest
        var T,TB;
        if(angular.isDefined(data.content)){
            type = 1;
            TB = data.content.taskbags;
            T = data.content.tasks;
        }else{
            type = 0;
            TB = data.taskbags;
            T = data.tasks;
        } 

        var taskCount = T.length;
        var taskCount_ind = T.length;
        var pro = 0;
        var progress = 0;
        var time = 0; 
        var task_pro = 0;
        var ttp = 0;
        var TB_time_left = 1;
        var tasks_completed = 0;

        var tc_by_user = 0;
        var t_by_user = 0;
  

        var time_left;
        
        for(var i=0;i<T.length;i++){
            task_pro += T[i].progress;// Collecting total progress of tasks
            time += T[i].duration;// Collecting total duration of tasks
            tasks_completed += T[i].completed;// Collecting total completed tasks 
            if(T[i].assigned_to == vm.user.id){
                t_by_user ++;// Collecting total tasks by user
                tc_by_user += T[i].completed;// Collecting total completed tasks by user
            }

            T[i].start_date = new Date(T[i].start_date);// setting date object from string
            T[i].finish_date = new Date(T[i].finish_date);// setting date object from string 

            time_left = dateDiff(T[i].finish_date,new Date());
            time_left.time_left = 1;
            if(time_left.y < 0){
                time_left = dateDiff(new Date(),T[i].finish_date);
                time_left.time_left = 0;
                TB_time_left = 0;
            } 
            T[i].time_left = time_left;
            if(T[i].assigned_to == vm.user.id){
                data.assTo = vm.user.id;
            }
        }

        for(var i=0;i<TB.length;i++){
            if(angular.isDefined(TB[i].task_count))         taskCount += TB[i].task_count; // counting tasks
            if(angular.isDefined(TB[i].ttp))                ttp += TB[i].ttp; // counting total progress
            if(angular.isDefined(TB[i].progress))           pro += TB[i].progress;// Collecting total progress of taskbags
            if(angular.isDefined(TB[i].duration))           time += TB[i].duration;// Collecting total duration of taskbags
            if(angular.isDefined(TB[i].tasks_completed))    tasks_completed += TB[i].tasks_completed;// Collecting total duration of taskbags
            if(angular.isDefined(TB[i].t_by_user))    t_by_user += TB[i].t_by_user;// Collecting total duration of taskbags
            if(angular.isDefined(TB[i].tc_by_user))    tc_by_user += TB[i].tc_by_user;// Collecting total duration of taskbags
            if(TB[i].assTo == vm.user.id){ data.assTo = vm.user.id; }
        } 

        ttp += task_pro;  
        progress =  ttp/taskCount;
 
        data.time_left = TB_time_left;
        data.ttp = ttp;
        data.hasTasks = taskCount_ind;
        data.hasTaskbags = TB.length;
        data.task_count = taskCount;
        data.progress = progress;
        data.duration = time;
        data.t_by_user = t_by_user;
        data.tc_by_user = tc_by_user;
        data.tasks_completed = tasks_completed;
        if(type == 1){
            data.content.tasks = T;
            data.content.taskbags = TB;
        }else{
            data.tasks = T;
            data.taskbags = TB;
        } 
        return data;
    }

    function findArrayByLevel(level){
        var parents = findParents(level);
        var tempData = [];
        var tempDataTB = [];
        var taskbags = [];
        var t; 

        for(var i=0;i < parents.task.length;i++){
            for(var j=0;j < vm.taskD.length;j++){
                if(vm.taskD[j].parent_id == parents.task[i]){
                    tempData.push(vm.taskD[j]); 
                } 
            }
        } 

        for(var i=0;i < parents.taskbag.length;i++){
            for(var j=0;j < vm.taskbagD.length;j++){
                if(vm.taskbagD[j].parent_id == parents.taskbag[i]){
                    tempDataTB.push(vm.taskbagD[j]); 
                } 
            }
        }  
        return {tasks:tempData,taskbags:tempDataTB};
    }

    function findParents(level){
        var parents = [];
        var parentsTB = [];
        var found = false;
        for(var i=0; i < vm.taskD.length; i++){
            for(var j=0;j < parents.length;j++){
                if(parents[j] == vm.taskD[i].parent_id){
                    found = true;
                }
            }
            if(!found){
                if(vm.taskD[i].level == level){
                    parents.push(vm.taskD[i].parent_id);
                }
            }
            found = false; 
        }
        for(var i=0; i < vm.taskbagD.length; i++){
            for(var j=0;j < parentsTB.length;j++){
                if(parentsTB[j] == vm.taskbagD[i].parent_id){
                    found = true;
                }
            }
            if(!found){
                if(vm.taskbagD[i].level == level){
                    parentsTB.push(vm.taskbagD[i].parent_id);
                }
            }
            found = false;  
        } 
        return {task:parents,taskbag:parentsTB};
    }
 
    vm.navData = {} 

    vm.createTask = function(){ 
        if(!vm.taskAPIBusy){
            vm.navItem = {name:'Double Click',description:'About The Task',duration:1,progress:0,priority:0,assigned_to:1,start_date:new Date(),finish_date:new Date(moment(Date.now()).add(5,'days')),type:'task',status:'INACTIVE',completed:0};
            vm.navTaskCreate = true;
            var pid = 0;
            var level = 0;
            for(var i =0; i<vm.navPath.length;i++){
                level++;
                pid = vm.navPath[i];
            }
            vm.navItem.parent_id = pid; 
            vm.navItem.level = level; 
            vm.navItem.project_id = vm.projectDetails.id; 
        }
    }

    vm.createTaskbag = function(){ 
        if(!vm.taskAPIBusy){
            vm.navItem = {name:'Double Click',type:'taskbag',content:{}};
            vm.navTaskCreate = true;
            var pid = 0;
            var level = 0;
            for(var i =0; i<vm.navPath.length;i++){
                level++;
                pid = vm.navPath[i];
            }
            vm.navItem.parent_id = pid; 
            vm.navItem.level = level; 
            vm.navItem.project_id = vm.projectDetails.id; 
        }
    }

    vm.createTaskCancel = function(){
        vm.navItem = {duration:0,assigned_to:2,progress:0};
    }

    vm.createTaskSubmit = function(){  
        disableAll(); 
        vm.taskBtnPro.color = '#45ccce';
        vm.taskBtnPro.value = 8; 

        if(vm.navItem.type=='task'){ 
            var task = TokenHandler.wrapActions(
                $resource(loginService.host + '/tasks'),
                { 'save':   {method:'POST'}, isArray:false}
            );  
            task.save(vm.navItem).$promise.then(function(results) {
                if(results.type == 'task'){
                    vm.taskD.push(results);
                    vm.projectData = reorderingData(); 
                    navigate(vm.projectData,results.level);
                    saveSuccess(1);
                }
            });  
        }else{ 
            var taskbag = TokenHandler.wrapActions(
                $resource(loginService.host + '/taskbags'),
                { 'save':   {method:'POST'}, isArray:false}
            );  
            taskbag.save(vm.navItem).$promise.then(function(results) {
                if(results.type == 'taskbag'){
                    vm.taskbagD.push(results);
                    vm.projectData = reorderingData(); 
                    navigate(vm.projectData,results.level); 
                    saveSuccess(2);
                }
            });  
        }
    }

    function navigate(data,level){
            if(level==0){
            vm.navData = clearJunkData(data); 
        }else{
            for (var i = 0 ; i < vm.navPath.length; i++) {                
                for(var j =0; j < data.taskbags.length; j++) { 
                    if(data.taskbags[j].id == vm.navPath[i]){
                        data = data.taskbags[j].content; 
                        break;
                    }
                }
            } 
            vm.navItem = {duration:0,assigned_to:2,progress:0};
            clearTempVariables();
            vm.navData = clearJunkData(data); 
        } 
    }

    function saveSuccess(id){
        vm.taskBtnPro.value = 100;
        vm.taskBtnPro.duration = 800;
        $timeout(function() {
            enableAll();
            vm.taskBtnPro = {color:'#eaeaea',value:0,duration:16000}
            if(id==1){
                vm.createTask();
            }else{
                vm.createTaskbag();
            }
        }, 800);
    }

    function disableS2(){
        vm.slider.options.disabled = vm.priority.options.disabled = true;
    }
    function enableS2(){
        vm.slider.options.disabled = vm.priority.options.disabled = false;
    }

    function disableAll(){
        vm.taskAPIBusy = true;
        vm.slider.options.disabled = vm.progress.options.disabled = vm.priority.options.disabled = true;
    }
    function enableAll(){
        vm.taskAPIBusy = false;
        vm.slider.options.disabled = vm.progress.options.disabled = vm.priority.options.disabled = false;
    }
    vm.navItem = {duration:0,assigned_to:2,progress:0}; 
    var navItemTemp;
    var ni_name; 
    var ni_parent_id
    var ni_project_id
    var ni_description
    var ni_duration
    var ni_progress
    var ni_priority
    var ni_level
    var ni_assigned_to
    var ni_start_date
    var ni_finish_date
    var ni_type
    var ni_status
    var ni_completed 

    vm.navPath = []
    vm.navPathNameArr = [];
    vm.navPathName = ""; 
    vm.taskBtnPro = {color:'#eaeaea',value:0,duration:16000}
    vm.navItemsavingList = [];

    function findDelElements(data){
        var id = data.id;
        var type = data.type;
        var level = findTopLevel();
        var el;
        var ids = {tasks:[],taskbags:[]};
        if(type=='task'){ 
            return {tasks:[id],taskbags:[]};
        }else{
            ids.taskbags.push(id);
            for(var i=0;i<vm.taskbagD.length;i++){
                if(vm.taskbagD[i].id == id){
                    el = vm.taskbagD[i];
                }
            }  
            for(var i=el.level+1;i<=level;i++){
                for(var j=0;j<ids.taskbags.length;j++){ 
                    for(var k=0;k<vm.taskbagD.length;k++){
                        if(ids.taskbags[j]==vm.taskbagD[k].parent_id){
                            ids.taskbags.push(vm.taskbagD[k].id);
                        } 
                    }
                    for(var k=0;k<vm.taskD.length;k++){
                        if(ids.taskbags[j]==vm.taskD[k].parent_id){
                            ids.tasks.push(vm.taskD[k].id);
                        } 
                    }
                }
            }
            return ids;
        }
    }

    vm.deleteReq = function(){
        if(!vm.taskAPIBusy){
            disableAll();
            vm.message = {
                show:true,
                description:getMesDesc(),
                buttons:{yes:true,no:true,cancel:false}, 
                yes:deleteItem,
                no:deleteItem,
            }
        }
    }

    function getMesDesc(){
        var str;
        str = 'Do you want to Delete the ' + vm.navItem.type + ' "' + vm.navItem.name + '" ?'
        if(vm.navItem.type == 'taskbag'){
            // str += 'This Taskbag has ' + vm.navItem.hasTaskbags + ' and has ' + vm.navItem.hasTasks + ' Tasks.'
        }

        return str;
    }

    function deleteItem(id){ 
        if(id==1){
            var delObj = findDelObj();  
            var del = TokenHandler.wrapActions(
                $resource(loginService.host + '/tasks'),
                { 'delete':   {method:'DELETE'}, isArray:true}
            );  
            vm.message.show = false;
            del.delete(delObj).$promise.then(function(results) {  
                vm.navItem = {duration:0,assigned_to:2,progress:0};
                removeDataFromJS(results);
                enableAll();
            }); 
        }else{ 
            enableAll();
            vm.message.show = false;
        } 
    }

    function findDelObj(){
        var a = {};
        a.id = vm.navItem.id;
        a.type = vm.navItem.type;
        a.level = findTopLevel();
        return a;
    }

    function removeDataFromJS(list){
        for(var i=0; i<list.tasks.length; i++){
            for(var j=0;j < vm.taskD.length; j++){
                if(vm.taskD[j].id == list.tasks[i]){
                    vm.taskD.splice(j,1);
                } 
            }
        } 
        for(var i=0; i<list.taskbags.length; i++){
            for(var j=0;j < vm.taskbagD.length; j++){
                if(vm.taskbagD[j].id == list.taskbags[i]){
                    vm.taskbagD.splice(j,1);
                } 
            }
        } 
        vm.projectData = reorderingData(); 
        navigate(vm.projectData,vm.navPath.length); 
    }

    vm.pathNavigate = function(id){
        if(!vm.taskAPIBusy && vm.navPath.length > 0){
            var looper = vm.navPath.length - id;
            checkObjChanged();
            if(looper > 0){
                for(var i=0;i <looper;i++){
                    vm.navPath.pop(); 
                    vm.navPathNameArr.pop();
                }
                vm.selectNavData(-2);
            } 
        }
    }
    function saveData(callback){
        var id = 0; 
        for(var i=0;i<vm.navItemsavingList.length;i++){
            for(var j=0;j<vm.navData.tasks.length;j++){
                id = vm.navData.tasks[j].id;
                if(angular.isDefined(vm.navItemsavingList[id])){
                    if(vm.navItemsavingList[id] == 'task') {
                        saveDataAPI(vm.navData.tasks[j],callback); 
                        vm.navItemsavingList[id] = undefined;
                    }
                }
            }
            for(var j=0;j<vm.navData.taskbags.length;j++){
                id = vm.navData.taskbags[j].id; 
                if(angular.isDefined(vm.navItemsavingList[id])){
                    if(vm.navItemsavingList[id] == 'taskbag') {
                        saveDataAPI(vm.navData.taskbags[j],callback); 
                        vm.navItemsavingList[id] = undefined;
                    }
                }
            }
        } 
    }
    function saveDataAPI(data,callback){ 
        var type;
        if(data.type=='task'){
            type = '/tasks_update'
            if(data.completed){
                data.progress = 100;
            }
        }else{
            type = '/taskbags_update'
        } 
        var El = TokenHandler.wrapActions(
            $resource(loginService.host + type),
            { 'save':   {method:'POST'}, isArray:false}
        );  
        El.save(data).$promise.then(function(results) { 
            data.saving = false;  
            vm.projectData = reorderingData();   
            setTempVariables();
            navigate(vm.projectData,vm.navPath.length); 
            if(angular.isDefined(callback)){
                callback();
            }
        }); 
    } 
    function checkObjChanged(callback){  
        if(isObjectChanged()){ 
            vm.navItem.saving = true;
            // Create auto save function here 
            vm.navItemsavingList[vm.navItem.id] = vm.navItem.type; 
            saveData(callback);
        }else{ 
            if(angular.isDefined(callback)){
                callback();
            }
        }
    }

    vm.saveNavItem = function(){
        if(!vm.taskAPIBusy){
            checkObjChanged();
        } 
    }

    vm.navItemClick = function(data){    
        if(!vm.taskAPIBusy){
            checkObjChanged();
            vm.taskBtnPro = {color:'#eaeaea',value:0,duration:16000}
            vm.navItem = data;    

            setTempVariables();
            
            vm.navTaskCreate = false;
            setMSel(); 

            if(vm.navItem.assigned_to == vm.user.id || vm.user.level > 0){
                vm.progress.options.disabled = false;
            }else{
                vm.progress.options.disabled = true;
            } 
        }
    }  

    vm.toggleCompleted = function(){
        if(vm.navItem.assigned_to == vm.user.id || vm.scene2 == 1){
            if(vm.navItem.completed){
                vm.navItem.completed = false;
            }else{
                vm.navItem.completed = true;
            }
        }
    }

    function setTempVariables(){
        ni_name = vm.navItem.name; 
        ni_parent_id= vm.navItem.parent_id;
        ni_project_id= vm.navItem.project_id;
        ni_level= vm.navItem.level;
        ni_type= vm.navItem.type;
        
        if(vm.navItem.type == 'task'){
            ni_description= vm.navItem.description;
            ni_duration= vm.navItem.duration;
            ni_progress= vm.navItem.progress;
            ni_priority= vm.navItem.priority;
            ni_assigned_to= vm.navItem.assigned_to;
            ni_start_date= vm.navItem.start_date;
            ni_finish_date= vm.navItem.finish_date;
            ni_status= vm.navItem.status;
            ni_completed = vm.navItem.completed;
        }
    }
    function clearTempVariables(){
        ni_name = undefined; 
        ni_parent_id = undefined;
        ni_project_id = undefined;
        ni_level = undefined;
        ni_type = undefined;
        ni_description= undefined;
        ni_duration= undefined;
        ni_progress= undefined;
        ni_priority= undefined;
        ni_assigned_to= undefined;
        ni_start_date= undefined;
        ni_finish_date= undefined;
        ni_status= undefined;
        ni_completed = undefined;
    }
    function isObjectChanged(){ 
        if(
            ni_name == vm.navItem.name && 
            ni_parent_id== vm.navItem.parent_id &&
            ni_project_id== vm.navItem.project_id &&
            ni_level== vm.navItem.level &&
            ni_type== vm.navItem.type
            ){ 
            if(ni_type == 'task'){
                if(
                    ni_description== vm.navItem.description &&
                    ni_duration== vm.navItem.duration &&
                    ni_progress== vm.navItem.progress &&
                    ni_priority== vm.navItem.priority &&
                    ni_assigned_to== vm.navItem.assigned_to &&
                    ni_start_date== vm.navItem.start_date &&
                    ni_finish_date== vm.navItem.finish_date &&
                    ni_status== vm.navItem.status &&
                    ni_completed == vm.navItem.completed 
                ){
                    return false;
                }
            }else{
                return false;
            }
        } 
        vm.navItemsavingList[vm.navItem.id]=(vm.navItem.id);
        return true;
    }

    vm.prevTab = function(e){ 
        if(e.keyCode == 9){
            e.preventDefault();
        }
    }

    vm.navBack = function(){ 
        if(!vm.taskAPIBusy && vm.navPath.length > 0){
            checkObjChanged();
            vm.navPath.pop(); 
            vm.navPathNameArr.pop();
            vm.selectNavData(-2);
        }
    }

    vm.selectNavData = function(itemData){ 
        if(!vm.taskAPIBusy){
            var id = itemData.id;
            var data = vm.projectData; 
            var snd_level = 0; 
            if(id == -1){ 
                vm.navData = clearJunkData(data);
            }else{
                if(id>=0){
                    vm.navPath.push(id);  
                    vm.navPathNameArr.push({name:itemData.name}); 
                } 
                for (var i = 0 ; i < vm.navPath.length; i++) {                
                    for(var j =0; j < data.taskbags.length; j++) { 
                        if(data.taskbags[j].id == vm.navPath[i]){
                            data = data.taskbags[j].content; 
                            break;
                        }
                    }
                } 
                vm.navItem = {duration:0,assigned_to:2,progress:0};
                clearTempVariables();
                vm.navData = clearJunkData(data); 
            }    
        } 
    } 

    vm.isSelected = function(data){
        if(angular.isDefined(vm.navItem)){
            if(vm.navItem.id == data.id && vm.navItem.type == data.type){
                return true;
            }else{
                return false;
            }
        }else{
            return false;
        }
    }

    function clearJunkData(data){   
        // Nothing to clear. All clear :)
        return data;
    }
  

    $rootScope.noHeader = true;
    $rootScope.halfViewPort = true;

    function getUsers(){ 
        var users = TokenHandler.wrapActions(
            $resource(loginService.host + '/users'),
            ['query']
        );  
        users.query({}).$promise.then(function(results) {
            vm.users = results;
        }); 
    } 

    vm.projectDetails = {id:1}

    function getProData(callback){ 
        var pdata = TokenHandler.wrapActions(
            $resource(loginService.host + '/projects/'+vm.projectDetails.id+'/details'),
            ['query']
        );  
        pdata.query({}).$promise.then(function(results) { 
            vm.taskD = [];  
            vm.taskbagD = []; 
            angular.forEach(results[0].tasks, function(value, key) {
              this.push(value);
            }, vm.taskD);
            angular.forEach(results[0].taskbags, function(value, key) {
              this.push(value);
            }, vm.taskbagD);  
            vm.projectData = reorderingData();  
            vm.navData = vm.projectData;   
            callback();
            vm.selectNavData(-1,-1); // --------------------------------------------- should remove this
        }); 
    } 


    console.log(vm.user);

    getUsers();
    // ---------------------------------------  task editor stuffs ------------------------------------------------

    vm.mSelBlur = function(){ 
        if(!vm.taskAPIBusy&&vm.scene2==1){
            setMSel();
            vm.mSel = false;
        }
        // document.getElementById("mSel").focus();
    }
    vm.mSelFocus = function(){
        if(!vm.taskAPIBusy&&vm.scene2==1){
            vm.mSel = true;
        }
    }
    function setMSel(){
        for(var i =0;i < vm.users.length ; i++){
            if(vm.users[i].id == vm.navItem.assigned_to){
                vm.mSelValue = vm.users[i].name; 
            }
        } 
    }

    vm.slider = {
      value: 3, 
      options: {
        floor: 1,
        ceil: 48,
        translate: function(value, sliderId, label) { 
              return  value + ' Hours';
        },
        showSelectionBar: true,
        getPointerColor: function(value) { 
            return '#2D666F';
        }
      }
    };


    vm.progress = {
      value: 0, 
      options: {
        floor: 0,
        ceil: 100,
        translate: function(value, sliderId, label) { 
              return  value + '%';
        },
        showSelectionBar: true,
        getPointerColor: function(value) { 
            return '#2D666F';
        }
      }
    };


    vm.progressC = {
      value: 0, 
      options: {
        floor: 0,
        ceil: 100,
        disabled:true,
        translate: function(value, sliderId, label) { 
              return  value + '%';
        },
        showSelectionBar: true,
        getPointerColor: function(value) { 
            return '#2D666F';
        }
      }
    };

    vm.priority = {
        value: 1,
        options: {
            ceil: 3,
            showSelectionBar: true,
            getSelectionBarColor: function(value) {
                if (value <= 1)
                    return '#2AE02A';
                if (value <= 2)
                    return 'orange';
                if (value <= 3)
                    return 'red';
                return '#2AE02A';
            },
            translate: function(value, sliderId, label) { 
                if(value==0){ return 'Low'; }else 
                if(value==1){ return 'Normal'; }else 
                if(value==2){ return 'Medium'; }else 
                if(value==3){ return 'High'; } 
            },
            getPointerColor: function(value) { 
                if (value <= 0)
                    return '#888';
                if (value <= 1)
                    return '#2AE02A';
                if (value <= 2)
                    return 'orange';
                if (value <= 3)
                    return 'red';
                return '#888';
            }
        }
    };

    vm.editName = false;
    vm.editFalse = false;
    vm.fieldClick = function(v,str){
        if(!vm.taskAPIBusy&&vm.scene2==1){
            if(v==1){ 
                vm.tempName = str;
                vm.editName = true;
            }else if(v==2){
                vm.tempDesc = str;
                vm.editDesc = true;
            }else if(v==3){
                vm.tempTBName = str;
                vm.editTBName = true
            }
        }
    }
    vm.fieldEdit = function(e,n){
        vm.shortkey(e);
        if(!vm.taskAPIBusy&&vm.scene2==1){
            if(e.keyCode == 13){
                if(n==1){
                    vm.editName = false;
                }
                if(n==3){
                    vm.editTBName = false;
                }
                if(n==2 && vm.keys.ctrl){
                    e.preventDefault();
                    vm.editDesc = false;
                }
            }else if(e.keyCode == 27){
                if(n==1){
                    vm.navItem.name = vm.tempName;
                    vm.editName = false;
                }else if(n==2){
                    vm.navItem.description = vm.tempDesc;
                    vm.editDesc = false;
                }else if(n==3){
                    vm.navItem.name = vm.tempTBName;
                    vm.editTBName = false;
                }
            } 
        }
    }
    vm.keys = {}
    vm.keys.ctrl = false; 
    vm.keys.alt = false; 
    vm.keys.shift = false; 

    vm.shortkey = function(e){ 
        if(e.type=='keydown'){
            if(e.keyCode==16) vm.keys.shift = true;
            if(e.keyCode==17) vm.keys.ctrl = true;
            if(e.keyCode==18) vm.keys.alt = true;
        }else{
            if(e.keyCode==16) vm.keys.shift = false;
            if(e.keyCode==17) vm.keys.ctrl = false;
            if(e.keyCode==18) vm.keys.alt = false;
        }
    }
 

    // --------------------------------------- User assigning stuffs ------------------------------------------- //



    // ---------------------------------------  task editor stuffs ends ------------------------------------------------
  
    getProjects();
  })