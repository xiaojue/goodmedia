/**
 * @author fuqiang[designsor@gmail.com]
 * @date 20110822
 * 补充jquery不能loadcss
 */
(function(W,$,doc){
	//加载css
	var loadcss=function(file){
		if(GM.debug) file=GM.locality(file);
		var link=$('<link>').attr({
					type:'text/css',
					rel:'stylesheet',
					href:file+'?t='+new Date().valueOf()+'.css'
				});
		$('head').prepend(link);
	}
	
	//增加style行内样式
	var insertstyle=function(name,value){
		
	}
	
	$.extend({
		loadcss:loadcss,
		insertstyle:insertstyle
	})
	
})(window,jQuery,document);
