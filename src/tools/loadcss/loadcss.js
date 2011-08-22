/**
 * @author fuqiang[designsor@gmail.com]
 * @date 20110822
 * 补充jquery不能loadcss
 */
(function(W,$){
	
	var loadcss=function(file){
		var link=$('<link>').attr({
					type:'text/css',
					rel:'stylesheet',
					href:file
				});
		$('head').prepend(link);
	}
	
	$.extend({
		loadcss:loadcss
	})
	
})(window,jQuery);
