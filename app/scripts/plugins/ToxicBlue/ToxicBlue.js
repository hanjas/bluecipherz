/*============================================================================================================================================ |
* ============================================================================================================================================ |
* ================================================================= BLUE PAGES =============================================================== |
* ============================================================================================================================================ |
* ============================================================================================================================================ |
*
*
* Framework : ToxicBlue
* Author : waxx04
* created at : 26 / 05 / 2016
*
*
*/

var resp = {
	ww:$(window).width(),
	wh:$(window).height(),
	phone:431,
	tab_pot:768,
	tab_land:992,
	desktop:1336,
	extra_large:1600,
	hd:1920,
	is:{
		phone : function(){ if( resp.ww <= resp.phone ){ return true }else{ return false } },
		tab_pot : function(){ if( resp.ww > resp.phone && resp.ww <= resp.tab_pot ){ return true }else{ return false } },
		tab_land : function(){ if( resp.ww > resp.tab_pot && resp.ww <= resp.tab_land ){ return true }else{ return false } },
		desktop : function(){ if( resp.ww > resp.tab_land && resp.ww <= resp.desktop ){ return true }else{ return false } },
		extra_large : function(){ if( resp.ww > resp.desktop && resp.ww <= resp.extra_large ){ return true }else{ return false } },
		hd : function(){ if( resp.ww > resp.extra_large && resp.ww <= resp.hd ){ return true }else{ return false } },
	}
}


/*=========================================================*
 *														   *
 *  						BLUE 3D						   *
 *														   *
 *=========================================================*/

function Blue3D(){
	
	var me = this;
	me.x = 0;
	me.y = 0;
	me.X = 0;
	me.Y = 0;
	me.wh = $(window).height();
	me.ww = $(window).width();
	me.render = true; 
	var viewPortLimit = function(){ return true; };
	me.viewPortLimit = 0;

	me.para3dObjects = [];

	me.engine = function(){ }    	

	me.new3dObject = function(params){  
		me.para3dObjects.push(new bluePara3D({
			x_lim:params.x_lim,
			depth:params.depth,
			y_lim:params.y_lim,
			el:params.el,
			container:params.container
		}));
	}

	/*
	* Render 3D Variables
	*/

	var rotateY = 0;
	var rotateX = 0;
	var rotateZ = 0;
	var translateX = 0;
	var translateY = 0;

	me.setViewPortLimit = function(lim){
		if(lim == 'phone'){ viewPortLimit = resp.is.phone }else
		if(lim == 'tab_pot'){ viewPortLimit = resp.is.tab_pot }else
		if(lim == 'tab_land'){ viewPortLimit = resp.is.tab_land }else
		if(lim == 'desktop'){ viewPortLimit = resp.is.desktop }else
		if(lim == 'extra_large'){ viewPortLimit = resp.is.extra_large }else
		if(lim == 'hd'){ viewPortLimit = resp.is.hd }
	}

	function render3D(obj){
		obj.x = me.X * obj.x_lim / ( me.ww / 2 );
		obj.y = me.Y * obj.y_lim / ( me.wh / 2 );  
		
		// obj.x = ( me.x - obj.xMid ) * ( obj.x_lim /  ( me.ww / 2 ) );
		// obj.y = ( me.y - obj.yMid ) * ( obj.y_lim /  ( me.wh / 2 ) );

		if(obj.depth != 0){
			obj.el.css({'transform':'rotateY('+obj.x+'deg) rotateX('+( -1 * obj.y)+'deg) translateX('+( me.X / obj.depth * -1)+'px) translateY('+( me.Y / obj.depth * -1)+'px)'});   
		}else{ 
			obj.el.css({'transform':'rotateY('+obj.x+'deg) rotateX('+( -1 * obj.y)+'deg) '});  
		}
	} 

    function bluePara3D(params){
    	this.x_lim = params.x_lim;
    	this.y_lim = params.y_lim;
    	this.depth = params.depth;
    	this.el = params.el;
    	this.xMid = this.el.offset().left + ( this.el.width() / 2 );
    	this.pageTop=0; 

    	// this.resetPageTop = function(){
	    // 	if(params.container != undefined){
	    // 		this.pageTop=params.container.offset().top; 
	    // 	}
	    // 	this.yMid = this.el.offset().top + ( this.el.height() / 2 ) - this.pageTop;
	    // 	// this.yMid = this.pageTop;
    	// }

    	// this.resetPageTop();
    }

    me.render3D = function(){
    	for(var i=0;i < me.para3dObjects.length;i++){
    		render3D(me.para3dObjects[i]);
    	} 
    }

    me.resetPageTop = function(){
    	for(var i=0;i < me.para3dObjects.length;i++){
    		me.para3dObjects[i].resetPageTop();
    	} 
    }

    function freeAnim(){
    	var dir_x = false;
    	var dir_y = false; 
    	var incr_x = 2;
    	var incr_y = 2;
    	setInterval(function(){
    		// if(me.render){

	    		if(dir_x){
	    			me.x += incr_x;
	    			if(me.x > resp.ww){ dir_x = false } 
	    		}else{
	    			me.x -= incr_x; 
	    			if(me.x < 0){ dir_x = true } 
	    		}

	    		if(dir_y){
	    			me.y += incr_y;
	    			if(me.y > resp.wh){ dir_y = false } 
	    		}else{
	    			me.y -= incr_y; 
	    			if(me.y < 0){ dir_y = true } 
	    		}


		    	me.X = ( me.x - ( me.ww / 2 ) );
		    	me.Y = ( me.y - ( me.wh / 2 ) );  
		        me.render3D();

	    		console.log(me.x);
    		// }

    	},20); 
    }

    // freeAnim();

    $(document).mousemove(function(event) { 
    	// console.log(me.viewPortLimit);
    	if(me.render){  

    		if(resp.ww > me.viewPortLimit){

	    	me.x = event.pageX;
	    	me.y = event.pageY;
	    	me.X = ( me.x - ( me.ww / 2 ) );
	    	me.Y = ( me.y - ( me.wh / 2 ) ); 
	        me.engine(me); 
	        me.render3D();

    		}
    	}
    });
}

/*============================= BLUE3D ENDS ===============================*/
 

/*============================================================================================================================================ |
* ============================================================================================================================================ |
* ================================================================= BLUE PAGES =============================================================== |
* ============================================================================================================================================ |
* ============================================================================================================================================ |
*
*
* Framework : BluePages
* Author : waxx04
* created at : 26 / 05 / 2016
*
*
* 1) To Initialize the framework first give the id 'bluePage' to the container div 
* 2) Create bluePages object
* 3) Reset the container if needed
* 4) Call init function
*
*/

function BluePages(){
	var me = this;
	me.st = 0;
	me.stTemp = 0;
	me.container = $('#bluePages');
	me.containerId = me.container.attr('id');

	me.scrollLength = 30;
	me.scrollCutVal = 0;
	me.pagesH = $(window).height();
	me.pages = me.container.children().length;
	me.curr_page = {id:1 , el : {}, name: '',ctrl :0 };  
	me.landingTime = 1000;
	me.animSpeed = 300;
	me.bp_scroll = false;
	me.scrollDir = 1; 
	me.controllers = [];
	me.pageChanging = false;

	me.touchStatus = true;

	me.engine = function(){ };

	me.init = function(){
		rewritePage();
		me.curr_page.el = $('#'+me.containerId+' > div:nth-child('+me.curr_page.id+')'); 
		me.container.addClass('bluePagesCont');
		addBlueId();
		runController();	
		ScopeFunction();
		runScopeFunction();
		setPagination();

		$('#bpScroller').height(resp.wh +100 )

	} 
	function addBlueId(){
		var elms = $('#'+me.containerId+' > div');
		for(var i=0; i<elms.length; i++){  
			$(elms[i]).addClass('$blueId'+i+1+'$');
		}
	}
	me.pageViewControl = []

	function rewritePage(){
		var rrel;
		var rrelShow = false;
		for(var i=0;i<me.pageViewControl.length;i++){ 
			rrelShow = false;
			for(var j=0;j<me.pageViewControl[i].views.length;j++){ 
				if(me.pageViewControl[i].views[j] == 'phone'){ 
					if(resp.is.phone()){ rrelShow = true  } 
				}else 

				if(me.pageViewControl[i].views[j] == 'tab_pot'){ 
					if(resp.is.tab_pot()){ rrelShow = true } 
				}else

				if(me.pageViewControl[i].views[j] == 'tab_land'){
					if(resp.is.tab_land()){ rrelShow = true } 
				}else

				if(me.pageViewControl[i].views[j] == 'desktop'){
					if(resp.is.desktop()){ rrelShow = true } 
				}else

				if(me.pageViewControl[i].views[j] == 'extra_large'){
					if(resp.is.extra_large()){ rrelShow = true } 
				}else

				if(me.pageViewControl[i].views[j] == 'hd'){
					if(resp.is.hd()){ rrelShow = true } 
				} 	
			}
			if(!rrelShow){  
				$('[bp-controller="'+me.pageViewControl[i].name+'"]').remove(); 
			} 
		}
		me.pages = me.container.children().length;
	}

	function hideView(el){
		el.remove();
	}

	var dep = { 
		show : function(resp){
			console.log(resp);
		}
	}

	me.controller = function(name,ctrl){ 
		me.controllers[name] = ctrl;  
	} 

	function isDefined(val){
		if(val != undefined && val != null && val != '' ){
			return true;
		}else{
			return false;
		}
	}

	var scopeFunction = {
		viewHeight : function(size){ 
			ctrlNow.size = size;
		} 
	} 

	var $scope = {}
	$scope.bp_classEls = []

	function ScopeFunction(){
		var tempVar = $('[bp-class]'); 
		var tempEl; 
		var tempAttr;
		for(var i=0;i<tempVar.length;i++){
			tempAttr = $(tempVar[i]).attr('bp-class').split(',');
			for(var j=0;j<tempAttr.length;j++){ 
				tempAttr[j] = tempAttr[j].split(':');
				tempEl = { 
					element : $(tempVar[i]),
					class:tempAttr[j][0],
					condition:tempAttr[j][1],
				} 
				$scope.bp_classEls.push(tempEl);
			}
		} 
	}

	function runScopeFunction(){
		var tempEl;
		for(var i=0; i< $scope.bp_classEls.length; i++ ){
			tempEl = $scope.bp_classEls[i];
			if(eval(tempEl.condition)){ 
				tempEl.element.addClass(tempEl.class); 
			}else{ 
				tempEl.element.removeClass(tempEl.class);  
			}
			
		}
	}

	function setPagination(){  
		$('body').append('<div class="bluePagination" id="bluePagination"><div class="bpPointer"></div></div>');
		for(var i = 1; i <= me.pages; i++){
			$('#bluePagination').append('<div class="bp_dot" bp-page-id='+i+'><div></div></div>');
		}
		var margin = ( $('#bluePagination').outerHeight() / 2 / me.pages ) - 9 ;
		$('#bluePagination > .bp_dot').css({'margin':margin+'px 0'});
		$('#bluePagination > .bpPointer').css({'top':margin+'px','opacity':'0.3'}); 
	} 

	me.enablePagination = function(){
		$('#bluePagination').css({'right':'20px','opacity':'1'});
	}

	function runPagination(){ 
		var margin = (( $('#bluePagination').outerHeight() /  me.pages * (me.curr_page.id - 1) ) ) +  (( $('#bluePagination').outerHeight() / 2 / me.pages ) - 9 )  ; 
		$('#bluePagination > .bpPointer').css({'top':margin+'px'});
	}

	$('body').on('click','.bp_dot',function(){
		var pg_id= $(this).attr('bp-page-id');
		me.curr_page.id = pg_id;
		moveTo(); 
	});

	var ctrlNow = 0;

	function runController(){
		var tempCtrl = me.curr_page.el.attr('bp-controller'); 
		if(tempCtrl != undefined){
			me.curr_page.ctrl = tempCtrl; 
			if(me.controllers[me.curr_page.ctrl] != undefined){
				ctrlNow = new me.controllers[me.curr_page.ctrl](scopeFunction); 
				if(ctrlNow.afterLoad != undefined){
					setTimeout(function(){
						ctrlNow.afterLoad(); 
					},me.animSpeed);
				} 
			}
		}else{
			tempCtrl = 0;
		} 
		runScopeFunction();
	}

	function moveTo(){   
			me.pageChanging = true;
			me.landing = true;	
			if(me.curr_page.id < 0 ) me.bp_scroll = 0;
			if(me.curr_page.id > me.pages ) me.bp_scroll = me.pages;

			me.curr_page.el = $('#'+me.containerId+' > div:nth-child('+me.curr_page.id+')'); 
			runController(); 
			runPagination();
			// if(resp.ww > resp.tab_land){
				me.container.animate({scrollTop : ( ( me.curr_page.id - 1 )  * me.pagesH ) },me.animSpeed);  
				// $('#'+me.containerId+' > div:nth-child(1)').css({'margin-top' : ( ( me.curr_page.id - 1 )  * me.pagesH * -1 ) });  
				me.disableScroll();
				// setWindoScroll();
				setTimeout(function(){ 
					me.landing = false;
					me.bp_scroll = false;
					me.enableScroll();
					me.pageChanging = false; 
				},me.animSpeed + me.landingTime);
			// } 
	} 

	function setWindoScroll(){
		var tempInter = setInterval(function(){ 
			$('body').animate({scrollTop : 5}, 0); 
				console.log('cleared');
			if($('body').scrollTop() == 5){ 
				setTimeout(function(){ 
				},2000);
				clearInterval(tempInter);
			}
		},10);		
	}
/*
	$(window).scroll(function(){ 
		me.st = $(window).scrollTop();
		me.offsetTop = me.st;
		if(!me.pageChanging){ 
			if(me.st > me.stTemp){
				// scrolling down 
				console.log('down shit');
				if(me.bp_scroll == false){  
					me.scrollDir = 1;
					me.bp_scroll = true;
					me.curr_page.id++;  	
					moveTo();    
				}   
			}else{
				// scrolling up
				console.log('upshit');
				if(!me.bp_scroll){
					me.scrollDir = 0;
					me.bp_scroll = true;
					me.curr_page.id--; 
					moveTo(); 
				}  
			}
		}
		me.engine(me);
		me.stTemp = me.st; 
	}); 

*/

	function scrollUp(){
		if(me.touchStatus){ 
			me.curr_page.id--;  
			if(me.curr_page.id < 1){
				me.curr_page.id = 1;
			}
			moveTo(); 
		}
	} 

	function scrollDown(){
		if(me.touchStatus){ 
			if(me.curr_page.id < me.pages){ 
				me.curr_page.id++;  	
				moveTo();    
			}
		}
	}

	var e, wDelta; 
	function scrolled(wd){
		if(!me.pageChanging){  
			me.pageChanging = true;
			if(wd){ // DOWN 
				scrollDown(); 
			}else{ 
				scrollUp();
			}
		}
	}
	window.addEventListener('wheel', function(){
		e = window.event || e;
		wDelta = e.wheelDelta < 0 ? 1 : 0;
		scrolled(wDelta)
		// console.log(e);  
	},false);

	document.addEventListener('touchstart', handleTouchStart, false);        
	document.addEventListener('touchmove', handleTouchMove, false);

	var xDown = null;                                                        
	var yDown = null;                                                        

	function handleTouchStart(evt) {                                         
	    xDown = evt.touches[0].clientX;                                      
	    yDown = evt.touches[0].clientY;                                      
	};                                                

	function handleTouchMove(evt) {
	    if ( ! xDown || ! yDown ) {
	        return;
	    }

	    var xUp = evt.touches[0].clientX;                                    
	    var yUp = evt.touches[0].clientY;

	    var xDiff = xDown - xUp;
	    var yDiff = yDown - yUp;

	    if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {/*most significant*/
	        if ( xDiff > 0 ) {
	            /* left swipe */ 
	        } else {
	            /* right swipe */
	        }                       
	    } else {
	        if ( yDiff > 0 ) {
	            /* up swipe */ 
				scrollDown();  
	        } else {  
	            /* down swipe */
				scrollUp();  
	        }                                                                 
	    }
	    /* reset values */
	    xDown = null;
	    yDown = null;                                             
	};


	// disable scrolling

	// left: 37, up: 38, right: 39, down: 40,
	// spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
	var keys = {37: 1, 38: 1, 39: 1, 40: 1};

	function preventDefault(e) {
	  e = e || window.event;
	  if (e.preventDefault)
	      e.preventDefault();
	  e.returnValue = false;  
	}

	function preventDefaultForScrollKeys(e) {
	    if (keys[e.keyCode]) {
	        preventDefault(e);
	        return false;
	    }
	}

	me.disableScroll = function() { 
	  if (window.addEventListener) // older FF
	      window.addEventListener('DOMMouseScroll', preventDefault, false);
	  window.onwheel = preventDefault; // modern standard
	  window.onmousewheel = document.onmousewheel = preventDefault; // older browsers, IE
	  window.ontouchmove  = preventDefault; // mobile
	  document.onkeydown  = preventDefaultForScrollKeys;
	  $(document).bind('touchmove', function(e) {
	    e.preventDefault();
	  });
	}

	me.enableScroll = function() { 
	    if (window.removeEventListener)
	        window.removeEventListener('DOMMouseScroll', preventDefault, false);
	    window.onmousewheel = document.onmousewheel = null; 
	    window.onwheel = null; 
	    window.ontouchmove = null;  
	    document.onkeydown = null;  
	    $(document).unbind('touchmove');
	} 
}