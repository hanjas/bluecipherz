'use strict';

/**
 * @ngdoc service
 * @name bluroeApp.powerprogress
 * @description
 * # powerprogress
 * Service in the bluroeApp.
 */
angular.module('alFjrApp')
  .service('fileService', function ($rootScope,$cookieStore) {
    var fs = this;



    fs.FileSystem = function(){
      var vm = this;
    
    vm.pd_start_date = 0;
    vm.pd_finish_date = 0;
    vm.pd_deadline = 0;
    vm.pd_progress = 0;
    vm.pd_completed = 0;
    vm.FileData =  {taskbags:[],tasks:[]};



    vm.taskD = [];  
    vm.taskbagD = [];   

    vm.sc1bTemp = {pu:[]};
    vm.taskD = [];  
    vm.taskbagD = [];  
    vm.user = $cookieStore.get('userData');
    vm.genData = function(){  
      vm.FileData =  {taskbags:[],tasks:[]}; 
      vm.FileData = reorderingData();  
      return vm.FileData;
    }

    vm.putData = function(results){
        vm.taskD = [];  
        vm.taskbagD = [];

        angular.forEach(results[0].tasks, function(value, key) {
          this.push(value);
        }, vm.taskD);
        angular.forEach(results[0].taskbags, function(value, key) {
          this.push(value);
        }, vm.taskbagD);   
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
            vm.pd_progress = tempData.progress;
            proDataFetched = true;
        } 
        return tempData;
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


    }


  });
