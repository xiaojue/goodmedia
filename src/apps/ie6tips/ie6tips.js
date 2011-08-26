/**
 * @author <a href="mailto:designsor@gmail.com" target="_blank">Fuqiang[designsor@gmail.com]</a>
 * @version 20110812
 * @fileoverview IE6以下用户友情提示升级或者更换浏览器
 */
(function(W,G){
	/**
	 * @name GM.apps.ie6tips
	 * @private
	 */
	var ie6tips=function(){
		var temp= '<div id="ie6-warning">'+
					'您正在使用 Internet Explorer 6，本站部分效果和功能可能有损。建议您升级到 '+
					'<a href="http://www.microsoft.com/china/windows/internet-explorer/" target="_blank">Internet Explorer 8</a>'+
					'/ <a href="http://www.mozillaonline.com/">Firefox</a>'+
					'/ <a href="http://www.google.com/chrome/?hl=zh-CN">Chrome</a>'+
					'/ <a href="http://www.apple.com.cn/safari/">Safari</a>'+
					'/ <a href="http://www.operachina.com/">Opera</a> 以获得更好的体验与速度。'+
				 '</div>';
		return {
			/**
			 * @name GM.apps.ie6tips.exports
			 * @class
			 */
			exports:{
				/**
				 * @name GM.apps.ie6tips.exports.init
				 * @function
				 * @description IE6以下用户友情提示升级或者更换浏览器
				 */
				init:function(){
					var T;
					$.loadcss(GM.apps.host+'ie6tips/ie6tips.css');
					$('body').append(temp);
					$('#ie6-warning').hide().fadeIn('slow');
					
					function hide(){
						T=setTimeout(function(){
							$('#ie6-warning').fadeOut('slow');
						  },8000);
					}
					
					hide();
						
					$('#ie6-warning').mouseover(function(){
						clearTimeout(T);
					});
					
					$('#ie6-warning').mouseout(hide);
					
					$.cookie('ie6tips',1,{expires:1});
				}
			}
		}
	}();
	
	if(G && G.apps) G.apps.ie6tips=ie6tips;
	
})(window,GM);